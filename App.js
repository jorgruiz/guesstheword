import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Alert, SafeAreaView, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;

export default function App() {
  const [guess, setGuess] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [correctWord, setCorrectWord] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const titleAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchRandomWord();
    animateTitle();
  }, []);

  const animateTitle = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(titleAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(titleAnimation, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const fetchRandomWord = async () => {
    setIsLoading(true);
    try {
      let word;
      do {
        const response = await axios.get('https://random-word-api.herokuapp.com/word?number=1');
        word = response.data[0].toUpperCase();
      } while (word.length !== WORD_LENGTH);
      
      setCorrectWord(word);
      console.log("Correct word:", word); // For debugging
    } catch (error) {
      console.error('Error fetching random word:', error);
      Alert.alert('Error', 'Error al obtener la palabra. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuess = () => {
    if (guess.length === WORD_LENGTH) {
      const upperGuess = guess.toUpperCase();
      setGuesses([...guesses, upperGuess]);
      
      if (upperGuess === correctWord) {
        Alert.alert("¡Felicidades!", "Adivinaste la palabra correctamente.");
        resetGame();
      } else if (guesses.length === MAX_ATTEMPTS - 1) {
        Alert.alert("Fin del juego", `La palabra correcta era: ${correctWord}`);
        resetGame();
      }
      setGuess('');
    } else {
      Alert.alert("Error", `La palabra debe tener ${WORD_LENGTH} letras.`);
    }
  };

  const resetGame = () => {
    fetchRandomWord();
    setGuesses([]);
    setGuess('');
  };

  const renderGuess = ({ item }) => {
    return (
      <View style={styles.guessContainer}>
        {item.split('').map((letter, index) => {
          let backgroundColor = '#3a3a3c';
          if (correctWord[index] === letter) {
            backgroundColor = '#538d4e';
          } else if (correctWord.includes(letter)) {
            backgroundColor = '#b59f3b';
          }
          return (
            <View key={index} style={[styles.letter, { backgroundColor }]}>
              <Text style={styles.letterText}>{letter}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  const titleScale = titleAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.titleContainer}>
        <Animated.Text style={[styles.title, { transform: [{ scale: titleScale }] }]}>
          Wordle
        </Animated.Text>
      </View>
      <View style={styles.gameArea}>
        <FlatList
          data={guesses}
          renderItem={renderGuess}
          keyExtractor={(item, index) => index.toString()}
          style={styles.guessList}
          contentContainerStyle={styles.guessListContent}
        />
        {[...Array(MAX_ATTEMPTS - guesses.length)].map((_, index) => (
          <View key={index} style={styles.emptyGuessContainer}>
            {[...Array(WORD_LENGTH)].map((_, letterIndex) => (
              <View key={letterIndex} style={styles.emptyLetter} />
            ))}
          </View>
        ))}
      </View>
      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          value={guess}
          onChangeText={setGuess}
          maxLength={WORD_LENGTH}
          placeholder={`Palabra de ${WORD_LENGTH} letras`}
          placeholderTextColor="#818384"
        />
        <TouchableOpacity
          style={[styles.button, guess.length !== WORD_LENGTH && styles.buttonDisabled]}
          onPress={handleGuess}
          disabled={guess.length !== WORD_LENGTH}
        >
          <Text style={styles.buttonText}>Adivinar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
          <Text style={styles.resetButtonText}>Reiniciar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121213',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  titleContainer: {
    marginTop: 40,
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    paddingTop: 40,
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  gameArea: {
    flex: 1,
    width: '100%',
    maxWidth: 350,
    justifyContent: 'flex-start',
  },
  guessList: {
    width: '100%',
  },
  guessListContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  guessContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyGuessContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  letter: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 3,
    borderRadius: 8,
  },
  letterText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  emptyLetter: {
    width: 50,
    height: 50,
    backgroundColor: '#3a3a3c',
    margin: 3,
    borderRadius: 8,
  },
  inputArea: {
    width: '100%',
    maxWidth: 350,
    marginTop: 20,
  },
  input: {
    height: 50,
    borderColor: '#3a3a3c',
    borderWidth: 2,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 10,
    fontSize: 18,
    color: '#ffffff',
    backgroundColor: '#121213',
  },
  button: {
    backgroundColor: '#538d4e',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#3a3a3c',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#121213',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3a3a3c',
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 18,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 18,
  },
});