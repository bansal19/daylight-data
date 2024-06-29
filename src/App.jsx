import React, { useState, useRef } from "react";
import axios from "axios";
import {
  Container,
  TextField,
  Typography,
  CircularProgress,
  Grid,
  Paper,
  IconButton,
  InputAdornment,
} from "@material-ui/core";
import { Send, Mic, Stop } from "@material-ui/icons";
import { marked } from "marked";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPlaying, setIsPlaying] = useState(false); // Track if audio is playing
  const audioRef = useRef(null);
  const inputRef = useRef(null);

  const handleInputChange = (event) => {
    setCurrentMessage(event.target.value);
  };

  const handleSendMessage = async () => {
    if (currentMessage.trim() === "") {
      console.log("Message is empty");
      return;
    }

    const userMessage = { sender: "user", text: currentMessage };
    setMessages([...messages, userMessage]);
    setCurrentMessage("");
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("https://whtmj2-5000.csb.app/api/chat", {
        prompt: currentMessage,
      });
      console.log("Received response from server:", res.data);
      if (res.data.responseText) {
        const aiMessage = {
          sender: "ai",
          text: res.data.responseText,
          html: marked(res.data.responseText), // Convert Markdown to HTML
        };
        setMessages([...messages, userMessage, aiMessage]);

        // Stop the previous audio if it's still playing
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }

        // Play the new audio
        const audio = new Audio(
          `https://whtmj2-5000.csb.app${res.data.audioUrl}`,
        );
        audio.play();
        audioRef.current = audio;
        setIsPlaying(true);

        audio.onended = () => {
          setIsPlaying(false);
        };
      } else {
        console.error("No response text received");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError(
        `Failed to send message. Server responded with: ${error.message}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = () => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = function (event) {
      const spokenMessage = event.results[0][0].transcript;
      setCurrentMessage(spokenMessage);
    };

    recognition.onerror = function (event) {
      console.error("Error during recognition:", event.error);
      setError("Voice recognition failed. Please try again.");
    };
  };

  const handleStopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <Container className="App">
      <Typography variant="h4" gutterBottom>
        Voice Assistant
      </Typography>
      {messages.length > 0 ? (
        <Paper className="chat-paper" elevation={0}>
          {messages.map((message, index) => (
            <Typography
              key={index}
              align={message.sender === "user" ? "right" : "left"}
              color={message.sender === "user" ? "primary" : "secondary"}
              className={
                message.sender === "user" ? "user-message" : "ai-message"
              }
              dangerouslySetInnerHTML={
                message.sender === "ai" ? { __html: message.html } : undefined
              }
            >
              {message.sender === "user" ? message.text : null}
            </Typography>
          ))}
        </Paper>
      ) : (
        <Typography className="welcome-text">
          Tell me about your project
        </Typography>
      )}
      <Grid container className="input-grid" alignItems="flex-end">
        <Grid item xs={12}>
          <TextField
            ref={inputRef}
            value={currentMessage}
            onChange={handleInputChange}
            placeholder="For example, 'I want to build a wind farm in Artic'"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            disabled={loading || isPlaying} // Disable input while loading or playing
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {isPlaying ? (
                    <IconButton onClick={handleStopAudio} color="default">
                      <Stop />
                    </IconButton>
                  ) : (
                    <>
                      <IconButton
                        onClick={handleVoiceInput}
                        color="secondary"
                        disabled={loading}
                      >
                        <Mic />
                      </IconButton>
                      <IconButton
                        onClick={handleSendMessage}
                        color="primary"
                        disabled={loading}
                      >
                        {loading ? <CircularProgress size={24} /> : <Send />}
                      </IconButton>
                    </>
                  )}
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>
      {error && (
        <Typography color="error" variant="body1" className="error-text">
          {error}
        </Typography>
      )}
    </Container>
  );
}

export default App;
