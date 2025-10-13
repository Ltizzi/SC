import { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { io, Socket } from "socket.io-client";

const colors = {
  background: "#282a36",
  currentLine: "#44475a",
  foreground: "#f8f8f2",
  comment: "#6272a4",
  cyan: "#8be9fd",
  green: "#50fa7b",
  orange: "#ffb86c",
  pink: "#ff79c6",
  purple: "#bd93f9",
  red: "#ff5555",
  yellow: "#f1fa8c",
};

export default function HomeScreen() {
  const [baseIp, setBaseIp] = useState("192.168.0");
  const [port, setPort] = useState("3000");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [foundServers, setFoundServers] = useState<string[]>([]);
  const socket = useRef<Socket | null>(null);

  const clearMessages = () => {
    setMessages([]);
  };

  const scanNetwork = async () => {
    setScanning(true);
    setFoundServers([]);
    setMessages((prev) => [
      ...prev,
      `🔍 Escaneando ${baseIp}.0-255:${port}...`,
    ]);

    const found: string[] = [];
    const batchSize = 20;

    for (let i = 0; i <= 255; i += batchSize) {
      const batch = [];
      for (let j = i; j < Math.min(i + batchSize, 256); j++) {
        const ip = `${baseIp}.${j}`;
        batch.push(checkServer(ip));
      }

      const results = await Promise.all(batch);

      results.forEach((result) => {
        if (result.ok) {
          found.push(result.ip);
          setMessages((prev) => [
            ...prev,
            `✓ Servidor encontrado: ${result.ip}`,
          ]);
        }
      });
    }

    setFoundServers(found);
    setMessages((prev) => [...prev, `Encontrados: ${found.length} servidores`]);
    setScanning(false);
  };

  const checkServer = (ip: string): Promise<{ ip: string; ok: boolean }> => {
    return new Promise((resolve) => {
      const url = `http://${ip}:${port}`;

      const testSocket = io(url, {
        timeout: 500,
        reconnection: false,
        transports: ["websocket"],
        forceNew: true,
      });

      const timeout = setTimeout(() => {
        testSocket.close();
        resolve({ ip, ok: false });
      }, 500);

      testSocket.on("connect", () => {
        clearTimeout(timeout);
        testSocket.close();
        resolve({ ip, ok: true });
      });

      testSocket.on("connect_error", () => {
        clearTimeout(timeout);
        testSocket.close();
        resolve({ ip, ok: false });
      });
    });
  };

  const testDirectConnection = () => {
    const testIp = "192.168.0.109";
    setMessages((prev) => [
      ...prev,
      `Probando conexión directa a ${testIp}:${port}...`,
    ]);
    connectToServer(testIp);
  };

  const connectToServer = (ip: string) => {
    if (socket.current?.connected) {
      socket.current.close();
    }

    const serverUrl = `http://${ip}:${port}`;
    socket.current = io(serverUrl, {
      transports: ["websocket"],
      forceNew: true,
    });

    socket.current.on("connect", () => {
      setConnected(true);
      setMessages((prev) => [...prev, `✓ Conectado a ${serverUrl}`]);
    });

    socket.current.on("message", (data) => {
      setMessages((prev) => [...prev, `← ${data}`]);
    });

    socket.current.on("disconnect", () => {
      setConnected(false);
      setMessages((prev) => [...prev, "✗ Desconectado"]);
    });

    socket.current.on("connect_error", (error) => {
      setMessages((prev) => [...prev, `✗ Error: ${error.message}`]);
    });
  };

  const disconnect = () => {
    if (socket.current) {
      socket.current.close();
    }
  };

  const sendMessage = () => {
    if (socket.current?.connected && message.trim()) {
      socket.current.emit("message", message);
      setMessages((prev) => [...prev, `→ ${message}`]);
      setMessage("");
    }
  };

  useEffect(() => {
    return () => {
      if (socket.current) {
        socket.current.close();
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Socket.IO Scanner</Text>
        <TouchableOpacity style={styles.clearButton} onPress={clearMessages}>
          <Text style={styles.clearButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, styles.inputFlex]}
          value={baseIp}
          onChangeText={setBaseIp}
          placeholder="192.168.0"
          placeholderTextColor={colors.comment}
          editable={!scanning && !connected}
        />
        <TextInput
          style={[styles.input, styles.inputSmall]}
          value={port}
          onChangeText={setPort}
          placeholder="3000"
          placeholderTextColor={colors.comment}
          keyboardType="numeric"
          editable={!scanning && !connected}
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={testDirectConnection}
        disabled={connected}
      >
        <Text style={styles.buttonText}>🔌 Test Conexión Directa</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          (scanning || connected) && styles.buttonDisabled,
        ]}
        onPress={scanNetwork}
        disabled={scanning || connected}
      >
        <Text style={styles.buttonText}>
          {scanning ? "Escaneando..." : "🔍 Escanear Red"}
        </Text>
      </TouchableOpacity>

      {scanning && (
        <ActivityIndicator
          size="large"
          color={colors.purple}
          style={styles.loader}
        />
      )}

      {foundServers.length > 0 && !connected && (
        <View style={styles.serversContainer}>
          <Text style={styles.subtitle}>Servidores encontrados:</Text>
          {foundServers.map((ip, index) => (
            <TouchableOpacity
              key={index}
              style={styles.serverButton}
              onPress={() => connectToServer(ip)}
            >
              <Text style={styles.serverButtonText}>
                {ip}:{port}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {connected && (
        <>
          <TouchableOpacity
            style={[styles.button, styles.buttonDanger]}
            onPress={disconnect}
          >
            <Text style={styles.buttonText}>Desconectar</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Mensaje a enviar"
            placeholderTextColor={colors.comment}
          />

          <TouchableOpacity style={styles.button} onPress={sendMessage}>
            <Text style={styles.buttonText}>Enviar</Text>
          </TouchableOpacity>
        </>
      )}

      <ScrollView style={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <Text key={index} style={styles.message}>
            {msg}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.purple,
  },
  clearButton: {
    backgroundColor: colors.currentLine,
    padding: 10,
    borderRadius: 8,
    width: 45,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
  },
  clearButtonText: {
    fontSize: 20,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: colors.cyan,
  },
  inputRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.currentLine,
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    color: colors.foreground,
    backgroundColor: colors.currentLine,
  },
  inputFlex: {
    flex: 2,
  },
  inputSmall: {
    flex: 1,
  },
  button: {
    backgroundColor: colors.purple,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 5,
  },
  buttonDisabled: {
    backgroundColor: colors.comment,
  },
  buttonDanger: {
    backgroundColor: colors.red,
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "600",
  },
  loader: {
    marginVertical: 20,
  },
  serversContainer: {
    backgroundColor: colors.currentLine,
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
  serverButton: {
    backgroundColor: colors.green,
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
  },
  serverButtonText: {
    color: colors.background,
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  messagesContainer: {
    flex: 1,
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.currentLine,
    paddingTop: 10,
  },
  message: {
    padding: 5,
    fontSize: 14,
    fontFamily: "monospace",
    color: colors.foreground,
  },
});
