import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    FlatList,
    Alert,
    SafeAreaView,
    Animated
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';

export default function GameScreen({ route, navigation }) {
    const { language, difficulty } = route.params;
    const [guess, setGuess] = useState('');
    const [guesses, setGuesses] = useState([]);
    const [correctWord, setCorrectWord] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isGameWon, setIsGameWon] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState(language);
    const titleAnimation = useRef(new Animated.Value(0)).current;

    const difficultyConfig = {
        'easy': 4,
        'medium': 5,
        'hard': 6
    };

    const wordLength = difficultyConfig[difficulty];
    const maxAttempts = wordLength + 1;

    useEffect(() => {
        setCurrentLanguage(language);
        fetchRandomWord(language);
        animateTitle();
    }, [language]);

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

    const fetchRandomWord = async (lang) => {
        setIsLoading(true);
        try {
            let word;
            do {
                const response = await axios.get(`https://random-word-api.herokuapp.com/word?lang=${lang}&number=1`);
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
                        [
                            {
                                text: "Nueva partida",
                                onPress: () => navigation.replace('Settings')
                            },
                            {
                                text: "Jugar otra vez",
                                onPress: resetGame
                            }
                        ]
                    );
                }, 500);
            } else if (guesses.length === maxAttempts - 1) {
                Alert.alert(
                    "Fin del juego",
                    `La palabra correcta era: ${correctWord}`,
                    [
                        {
                            text: "Nueva partida",
                            onPress: () => navigation.replace('Settings')
                        },
                        {
                            text: "Intentar otra vez",
                            onPress: resetGame
                        }
                    ]
                );
            }
            setGuess('');
        } else {
            Alert.alert("Error", `La palabra debe tener ${wordLength} letras.`);
        }
    };

    const resetGame = () => {
        fetchRandomWord(currentLanguage);
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
                <Animated.Text
                    style={[
                        styles.title,
                        { transform: [{ scale: titleScale }] }
                    ]}
                >
                    Wordle
                </Animated.Text>
                <TouchableOpacity
                    onPress={() => navigation.replace('Settings')}
                    style={styles.settingsButton}
                >
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
                    autoCapitalize="characters"
                />
                <TouchableOpacity
                    style={[
                        styles.button,
                        guess.length !== wordLength && styles.buttonDisabled
                    ]}
                    onPress={handleGuess}
                    disabled={guess.length !== wordLength}
                >
                    <Text style={styles.buttonText}>Adivinar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.resetButton}
                    onPress={resetGame}
                >
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
    }
});