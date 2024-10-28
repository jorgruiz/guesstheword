import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { StatusBar } from 'expo-status-bar';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
];

const DIFFICULTIES = [
  { code: 'easy', name: 'Fácil', length: 4 },
  { code: 'medium', name: 'Medio', length: 5 },
  { code: 'hard', name: 'Difícil', length: 6 },
];

export default function SettingsScreen({ navigation }) {
  const [language, setLanguage] = useState('en');
  const [difficulty, setDifficulty] = useState('medium');

  const handleStartGame = () => {
    navigation.navigate('Game', {
      language,
      difficulty,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <Text style={styles.title}>Wordle</Text>
        <Text style={styles.subtitle}>Configuración inicial</Text>

        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Idioma:</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={language}
              style={styles.picker}
              itemStyle={styles.pickerItem}
              onValueChange={setLanguage}
            >
              {LANGUAGES.map((lang) => (
                <Picker.Item 
                  key={lang.code} 
                  label={lang.name} 
                  value={lang.code} 
                  color="#ffffff"
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Dificultad:</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={difficulty}
              style={styles.picker}
              itemStyle={styles.pickerItem}
              onValueChange={setDifficulty}
            >
              {DIFFICULTIES.map((diff) => (
                <Picker.Item 
                  key={diff.code} 
                  label={diff.name} 
                  value={diff.code} 
                  color="#ffffff"
                />
              ))}
            </Picker>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.startButton} 
          onPress={handleStartGame}
        >
          <Text style={styles.startButtonText}>Comenzar juego</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121213',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 24,
    color: '#ffffff',
    marginBottom: 40,
  },
  pickerContainer: {
    width: '100%',
    marginBottom: 30,
  },
  pickerLabel: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 10,
  },
  pickerWrapper: {
    backgroundColor: '#3a3a3c',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    color: '#ffffff',
  },
  pickerItem: {
    color: '#ffffff',
    backgroundColor: '#3a3a3c',
  },
  startButton: {
    backgroundColor: '#538d4e',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
