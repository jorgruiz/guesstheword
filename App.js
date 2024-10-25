import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Alert, SafeAreaView, Animated, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  // Add more languages as needed
];

const DIFFICULTIES = [
  { code: 'easy', name: 'Fácil', length: 4 },
  { code: 'medium', name: 'Medio', length: 5 },
  { code: 'hard', name: 'Difícil', length: 6 },
];

export default function App() {
  const [guess, setGuess] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [correctWord, setCorrectWord] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState('en');
  const [difficulty, setDifficulty] = useState('medium');
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isGameWon, setIsGameWon] = useState(false);
  const titleAnimation = useRef(new Animated.Value(0)).current;

  const wordLength = DIFFICULTIES.find(d => d.code === difficulty).length;
  const maxAttempts = wordLength + 1;

  useEffect(() => {
    fetchRandomWord();
    animateTitle();
  }, [language, difficulty]);

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
        const response = await axios.get(`https://random-word-api.herokuapp.com/word?lang=${language}&number=1`);
        word = response.data[0].toUpperCase();
      } while (word.length !== wordLength);
      
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
    if (guess.length === wordLength) {
      const upperGuess = guess.toUpperCase();
      setGuesses([...guesses, upperGuess]);
      
      if (upperGuess === correctWord) {
        setIsGameWon(true);
        setTimeout(() => {
          Alert.alert(
            "¡Felicidades!",
            `Has adivinado la palabra: ${correctWord}`,
            [{ text: "Jugar de nuevo", onPress: resetGame }]
          );
        }, 500); // Delay to allow animation to play
      } else if (guesses.length === maxAttempts - 1) {
        Alert.alert("Fin del juego", `La palabra correcta era: ${correctWord}`);
        resetGame();
      }
      setGuess('');
    } else {
      Alert.alert("Error", `La palabra debe tener ${wordLength} letras.`);
    }
  };

  const resetGame = () => {
    fetchRandomWord();
    setGuesses([]);
    setGuess('');
    setIsGameWon(false);
  };

  const renderGuess = ({ item, index }) => {
    return (
      <Animated.View 
        style={[
          styles.guessContainer,
          {
            opacity: isGameWon && index === guesses.length - 1 ? 
              new Animated.Value(1).interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }) : 1
          }
        ]}
      >
        {item.split('').map((letter, letterIndex) => {
          let backgroundColor = '#3a3a3c';
          if (correctWord[letterIndex] === letter) {
            backgroundColor = '#538d4e';
          } else if (correctWord.includes(letter)) {
            backgroundColor = '#b59f3b';
          }
          return (
            <Animated.View 
              key={letterIndex} 
              style={[
                styles.letter, 
                { backgroundColor },
                isGameWon && index === guesses.length - 1 ? {
                  transform: [
                    {
                      scale: new Animated.Value(1).interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [1, 1.2, 1],
                      }),
                    },
                  ],
                } : {}
              ]}
            >
              <Text style={styles.letterText}>{letter}</Text>
            </Animated.View>
          );
        })}
      </Animated.View>
    );
  };

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
        <TouchableOpacity onPress={() => setIsSettingsVisible(true)} style={styles.settingsButton}>
          <Text style={styles.settingsButtonText}>⚙️</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.gameArea}>
        {isLoading ? (
          <Text style={styles.loadingText}>Cargando...</Text>
        ) : (
          <>
            <FlatList
              data={guesses}
              renderItem={renderGuess}
              keyExtractor={(item, index) => index.toString()}
              style={styles.guessList}
              contentContainerStyle={styles.guessListContent}
            />
            {[...Array(maxAttempts - guesses.length)].map((_, index) => (
              <View key={index} style={styles.emptyGuessContainer}>
                {[...Array(wordLength)].map((_, letterIndex) => (
                  <View key={letterIndex} style={styles.emptyLetter} />
                ))}
              </View>
            ))}
          </>
        )}
      </View>
      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          value={guess}
          onChangeText={setGuess}
          maxLength={wordLength}
          placeholder={`Palabra de ${wordLength} letras`}
          placeholderTextColor="#818384"
        />
        <TouchableOpacity
          style={[styles.button, guess.length !== wordLength && styles.buttonDisabled]}
          onPress={handleGuess}
          disabled={guess.length !== wordLength}
        >
          <Text style={styles.buttonText}>Adivinar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
          <Text style={styles.resetButtonText}>Reiniciar</Text>
        </TouchableOpacity>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isSettingsVisible}
        onRequestClose={() => setIsSettingsVisible(false)}
      >
        <View style={styles.modalView}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Configuración</Text>
            <TouchableOpacity onPress={() => setIsSettingsVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✖</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Idioma:</Text>
            <Picker
              selectedValue={language}
              style={styles.picker}
              onValueChange={(itemValue) => setLanguage(itemValue)}
            >
              {LANGUAGES.map((lang) => (
                <Picker.Item key={lang.code} label={lang.name} value={lang.code} />
              ))}
            </Picker>
          </View>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Dificultad:</Text>
            <Picker
              selectedValue={difficulty}
              style={styles.picker}
              onValueChange={(itemValue) => setDifficulty(itemValue)}
            >
              {DIFFICULTIES.map((diff) => (
                <Picker.Item key={diff.code} label={diff.name} value={diff.code} />
              ))}
            </Picker>
          </View>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => {
              setIsSettingsVisible(false);
              resetGame();
            }}
          >
            <Text style={styles.applyButtonText}>Aplicar y Reiniciar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  settingsButton: {
    marginLeft: 20,
    padding: 10,
  },
  settingsButtonText: {
    fontSize: 24,
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
  modalView: {
    margin: 20,
    backgroundColor: '#121213',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 24,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 18,
    marginRight: 10,
    color: '#ffffff',
  },
  picker: {
    height: 50,
    width: 150,
    color: '#ffffff',
  },
  applyButton: {
    backgroundColor: '#538d4e',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 10,
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center'
  }
});