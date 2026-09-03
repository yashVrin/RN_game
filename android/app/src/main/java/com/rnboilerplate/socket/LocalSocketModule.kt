package com.rnboilerplate.socket

import android.content.Context
import android.net.wifi.WifiManager
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.io.PrintWriter
import java.net.*
import java.util.Collections
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

class LocalSocketModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var serverSocket: ServerSocket? = null
    private var isServerRunning = false
    private val clientSockets = Collections.synchronizedList(mutableListOf<Socket>())
    private val clientWriters = Collections.synchronizedList(mutableListOf<PrintWriter>())

    private var clientSocket: Socket? = null
    private var clientWriter: PrintWriter? = null
    private var isClientConnected = false

    private val executor: ExecutorService = Executors.newCachedThreadPool()

    override fun getName(): String {
        return "LocalSocketModule"
    }

    private fun sendEvent(eventName: String, params: WritableMap) {
        if (reactContext.hasActiveReactInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        }
    }

    @ReactMethod
    fun getLocalIpAddress(promise: Promise) {
        try {
            val interfaces = Collections.list(NetworkInterface.getNetworkInterfaces())
            var wifiIp: String? = null
            var hotspotIp: String? = null
            var otherLanIp: String? = null

            for (intf in interfaces) {
                if (intf.isLoopback || !intf.isUp) continue
                val name = intf.name.lowercase()

                // Skip cellular / mobile data / tunnel interfaces
                if (name.contains("rmnet") || name.contains("ccmni") || name.contains("pdp") ||
                    name.contains("dummy") || name.contains("tun") || name.contains("ppp")) {
                    continue
                }

                val addrs = Collections.list(intf.inetAddresses)
                for (addr in addrs) {
                    if (!addr.isLoopbackAddress && addr is Inet4Address) {
                        val hostAddr = addr.hostAddress ?: continue
                        if (hostAddr.startsWith("127.")) continue

                        if (name.contains("ap") || name.contains("softap") || hostAddr.startsWith("192.168.43.")) {
                            hotspotIp = hostAddr
                        } else if (name.contains("wlan")) {
                            wifiIp = hostAddr
                        } else if (hostAddr.startsWith("192.168.") || hostAddr.startsWith("172.") || hostAddr.startsWith("10.0.") || hostAddr.startsWith("10.1.")) {
                            otherLanIp = hostAddr
                        }
                    }
                }
            }

            val resultIp = hotspotIp ?: wifiIp ?: otherLanIp ?: "192.168.43.1"
            promise.resolve(resultIp)
        } catch (e: Exception) {
            promise.resolve("192.168.43.1")
        }
    }

    @ReactMethod
    fun startServer(port: Int, promise: Promise) {
        if (isServerRunning) {
            promise.resolve(true)
            return
        }

        executor.execute {
            try {
                serverSocket = ServerSocket(port)
                isServerRunning = true
                promise.resolve(true)

                while (isServerRunning && serverSocket != null && !serverSocket!!.isClosed) {
                    try {
                        val socket = serverSocket!!.accept()
                        clientSockets.add(socket)
                        val writer = PrintWriter(OutputStreamWriter(socket.getOutputStream(), "UTF-8"), true)
                        clientWriters.add(writer)

                        val clientIp = socket.inetAddress.hostAddress ?: "unknown"
                        val connectParams = Arguments.createMap().apply {
                            putString("type", "CLIENT_CONNECTED")
                            putString("clientIp", clientIp)
                        }
                        sendEvent("onClientConnected", connectParams)

                        // Listen to client messages in separate thread
                        executor.execute {
                            try {
                                val reader = BufferedReader(InputStreamReader(socket.getInputStream(), "UTF-8"))
                                var line: String?
                                while (socket.isConnected && !socket.isClosed) {
                                    line = reader.readLine()
                                    if (line == null) break
                                    val msgParams = Arguments.createMap().apply {
                                        putString("message", line)
                                        putString("senderIp", clientIp)
                                    }
                                    sendEvent("onSocketMessage", msgParams)
                                }
                            } catch (e: Exception) {
                                // Client disconnected
                            } finally {
                                clientSockets.remove(socket)
                                clientWriters.remove(writer)
                                try { socket.close() } catch (ignored: Exception) {}
                                val disconnectParams = Arguments.createMap().apply {
                                    putString("type", "CLIENT_DISCONNECTED")
                                    putString("clientIp", clientIp)
                                }
                                sendEvent("onClientDisconnected", disconnectParams)
                            }
                        }
                    } catch (e: Exception) {
                        // Server accept loop broke
                    }
                }
            } catch (e: Exception) {
                isServerRunning = false
                try {
                    promise.reject("SERVER_ERROR", e.message)
                } catch (ignored: Exception) {}
            }
        }
    }

    @ReactMethod
    fun broadcastMessage(message: String, promise: Promise) {
        executor.execute {
            try {
                synchronized(clientWriters) {
                    for (writer in clientWriters) {
                        try {
                            writer.println(message)
                            writer.flush()
                        } catch (e: Exception) {
                            // Ignore individual write fail
                        }
                    }
                }
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("BROADCAST_ERROR", e.message)
            }
        }
    }

    @ReactMethod
    fun stopServer(promise: Promise) {
        executor.execute {
            try {
                isServerRunning = false
                synchronized(clientSockets) {
                    for (s in clientSockets) {
                        try { s.close() } catch (ignored: Exception) {}
                    }
                    clientSockets.clear()
                    clientWriters.clear()
                }
                serverSocket?.close()
                serverSocket = null
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("STOP_ERROR", e.message)
            }
        }
    }

    @ReactMethod
    fun connectToServer(host: String, port: Int, promise: Promise) {
        if (isClientConnected) {
            disconnectClientSync()
        }

        executor.execute {
            try {
                val socket = Socket()
                val socketAddress = InetSocketAddress(host, port)
                socket.connect(socketAddress, 5000) // 5s timeout

                clientSocket = socket
                clientWriter = PrintWriter(OutputStreamWriter(socket.getOutputStream(), "UTF-8"), true)
                isClientConnected = true

                promise.resolve(true)

                val connectParams = Arguments.createMap().apply {
                    putString("type", "CONNECTED")
                    putString("host", host)
                    putInt("port", port)
                }
                sendEvent("onConnectedToServer", connectParams)

                // Read incoming messages from Server
                try {
                    val reader = BufferedReader(InputStreamReader(socket.getInputStream(), "UTF-8"))
                    var line: String?
                    while (socket.isConnected && !socket.isClosed) {
                        line = reader.readLine()
                        if (line == null) break
                        val msgParams = Arguments.createMap().apply {
                            putString("message", line)
                            putString("senderIp", host)
                        }
                        sendEvent("onSocketMessage", msgParams)
                    }
                } catch (e: Exception) {
                    // Disconnected
                } finally {
                    isClientConnected = false
                    try { socket.close() } catch (ignored: Exception) {}
                    val discParams = Arguments.createMap().apply {
                        putString("type", "DISCONNECTED")
                    }
                    sendEvent("onDisconnectedFromServer", discParams)
                }
            } catch (e: Exception) {
                isClientConnected = false
                try {
                    promise.reject("CONNECT_ERROR", e.message ?: "Failed to connect to $host:$port")
                } catch (ignored: Exception) {}
            }
        }
    }

    @ReactMethod
    fun sendToServer(message: String, promise: Promise) {
        executor.execute {
            try {
                val writer = clientWriter
                if (writer != null && isClientConnected) {
                    writer.println(message)
                    writer.flush()
                    promise.resolve(true)
                } else {
                    promise.reject("NOT_CONNECTED", "Not connected to server")
                }
            } catch (e: Exception) {
                promise.reject("SEND_ERROR", e.message)
            }
        }
    }

    @ReactMethod
    fun disconnectClient(promise: Promise) {
        executor.execute {
            disconnectClientSync()
            promise.resolve(true)
        }
    }

    private fun disconnectClientSync() {
        isClientConnected = false
        try {
            clientWriter?.close()
            clientSocket?.close()
        } catch (ignored: Exception) {}
        clientWriter = null
        clientSocket = null
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for React Native built-in event emitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for React Native built-in event emitter
    }
}
