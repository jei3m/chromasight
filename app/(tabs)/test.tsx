import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

const ishiharaPlates = [
  { id: 1, image: require('./assets/plate1.png'), correctAnswer: '12', deficiencyType: 'red' },
  { id: 2, image: require('./assets/plate2.png'), correctAnswer: '8', deficiencyType: 'green' },
  { id: 3, image: require('./assets/plate3.png'), correctAnswer: '6', deficiencyType: 'yellow' },
  // Add more plates with correctAnswer and deficiencyType
];

interface Plate {
  id: number;
  image: any;
  correctAnswer: string;
  deficiencyType: string;
}

interface DeficiencyScore {
  red: number;
  green: number;
  yellow: number;
}

const generateChoices = (correctAnswer: string) => {
  const choices = [correctAnswer];
  while (choices.length < 3) {
    const randomChoice = Math.floor(Math.random() * 100).toString();
    if (!choices.includes(randomChoice)) {
      choices.push(randomChoice);
    }
  }
  return choices.sort(() => Math.random() - 0.5);
};

const IshiharaTest = () => {
  const [plates, setPlates] = useState<Plate[]>([]);
  const [currentPlateIndex, setCurrentPlateIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [deficiencyScore, setDeficiencyScore] = useState<DeficiencyScore>({ red: 0, green: 0, yellow: 0 });
  const [testCompleted, setTestCompleted] = useState(false);
  const [choices, setChoices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [correctAnswers, setCorrectAnswers] = useState<DeficiencyScore>({ red: 0, green: 0, yellow: 0 });

  useEffect(() => {
    initializeTest();
  }, []);

  const initializeTest = () => {
    const shuffledPlates = [...ishiharaPlates].sort(() => Math.random() - 0.5);
    setPlates(shuffledPlates);
    setChoices(generateChoices(shuffledPlates[0].correctAnswer));
    setIsLoading(false);

    const initialCorrectAnswers = shuffledPlates.reduce((acc, plate) => {
      acc[plate.deficiencyType as keyof DeficiencyScore] += 1;
      return acc;
    }, { red: 0, green: 0, yellow: 0 } as DeficiencyScore);
    setCorrectAnswers(initialCorrectAnswers);
  };

  const handleAnswer = (selectedAnswer: string) => {
    const currentPlate = plates[currentPlateIndex];
    if (selectedAnswer === currentPlate.correctAnswer) {
      setScore(score + 1);
    } else {
      setDeficiencyScore(prev => ({
        ...prev,
        [currentPlate.deficiencyType]: prev[currentPlate.deficiencyType as keyof DeficiencyScore] + 1
      }));
    }

    if (currentPlateIndex < plates.length - 1) {
      setCurrentPlateIndex(currentPlateIndex + 1);
      setChoices(generateChoices(plates[currentPlateIndex + 1].correctAnswer));
    } else {
      setTestCompleted(true);
    }
  };

  const restartTest = () => {
    setCurrentPlateIndex(0);
    setScore(0);
    setDeficiencyScore({ red: 0, green: 0, yellow: 0 });
    setTestCompleted(false);
    initializeTest();
  };

  const analyzeDeficiency = () => {
    const { red, green, yellow } = deficiencyScore;
    const total = red + green + yellow;

    if (total === 0) return "No color vision deficiency detected.";
    if (green > red && green > yellow) {
      return "You may have deuteranopia (green-blind) or deuteranomaly (green-weak).";
    } else if (red > green && red > yellow) {
      return "You may have protanopia (red-blind) or protanomaly (red-weak).";
    } else if (yellow > red && yellow > green) {
      return "You may have tritanopia (blue-yellow color blindness).";
    } else {
      return "You may have a combination of color vision deficiencies.";
    }
  };

  const renderResults = () => {
    const isPerfectScore = score === plates.length;
    const chartData = isPerfectScore
      ? [
          { name: 'Red', population: correctAnswers.red, color: 'rgba(255, 0, 0, 0.7)', legendFontColor: '#7F7F7F', legendFontSize: 12 },
          { name: 'Green', population: correctAnswers.green, color: 'rgba(0, 255, 0, 0.7)', legendFontColor: '#7F7F7F', legendFontSize: 12 },
          { name: 'Yellow', population: correctAnswers.yellow, color: 'rgba(255, 255, 0, 0.7)', legendFontColor: '#7F7F7F', legendFontSize: 12 },
        ]
      : [
          { name: 'Red', population: deficiencyScore.red, color: 'rgba(255, 0, 0, 0.7)', legendFontColor: '#7F7F7F', legendFontSize: 12 },
          { name: 'Green', population: deficiencyScore.green, color: 'rgba(0, 255, 0, 0.7)', legendFontColor: '#7F7F7F', legendFontSize: 12 },
          { name: 'Yellow', population: deficiencyScore.yellow, color: 'rgba(255, 255, 0, 0.7)', legendFontColor: '#7F7F7F', legendFontSize: 12 },
        ];
  
    return (
      <View style={styles.resultsContainer}>
            <View style={{ alignItems: 'center' }}>
      <Text style={styles.title}>ISHIHARA TEST</Text>
    </View>
        <View style={{ alignItems: 'center' }}>
          {/* <Text style={styles.results}>Test Completed!</Text> */}
          {/* <Text style={styles.score}>Your Score: {score} / {plates.length}</Text> */}
        </View>
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>
            {isPerfectScore ? "Color Distribution of Test Plates" : "Color Deficiency Distribution"}
          </Text>
          <PieChart
            data={chartData}
            width={300}
            height={200}
            chartConfig={{
              backgroundColor: '#1cc910',
              backgroundGradientFrom: '#eff3ff',
              backgroundGradientTo: '#efefef',
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="30"
            absolute
            style={styles.chart}
          />
        </View>
        <View style={styles.analysisContainer}>
          <Text style={styles.analysisTitle}>Analysis:</Text>
          <Text style={styles.interpretation}>{analyzeDeficiency()}</Text>
          <Text style={styles.score}>Your Score: {score} / {plates.length}</Text>
        </View>
        <TouchableOpacity style={styles.restartButton} onPress={restartTest}>
          <Text style={styles.restartButtonText}>Restart Test</Text>
        </TouchableOpacity>
      </View>
    );
  };
  

  const renderTest = () => {
    if (isLoading || plates.length === 0) {
      return <Text>Loading...</Text>;
    }

    return (
      <View>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.title}>ISHIHARA TEST</Text>
        </View>
        <View style={styles.imageContainer}>
        <Image source={plates[currentPlateIndex].image} style={styles.image} />
        </View>
        <View style={styles.questionContainer}>
          <Text style={styles.question}>CHOOSE YOUR ANSWER</Text>
          <View style={styles.choicesContainer}>
            {choices.map((choice, index) => (
              <TouchableOpacity
                key={index}
                style={styles.choiceButton}
                onPress={() => handleAnswer(choice)}
              >
                <Text style={styles.choiceText}>{choice}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
    {/* <View style={{ alignItems: 'center' }}>
      <Text style={styles.title}>ISHIHARA TEST</Text>
    </View> */}
    {testCompleted ? renderResults() : renderTest()}
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor:'black'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color:'white'
  },
  imageContainer:{
    width: 280,
    height: 260,
    backgroundColor:'white',
    marginBottom:20,
    borderRadius: 10,
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  image: {
    width: 240,
    height: 240,
    resizeMode: 'contain',
    borderRadius: 10,
    padding:10,
  },
  questionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)', 
    margin: 0,
    padding: 18, 
    borderRadius: 10, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, 
  },
  question: {
    fontSize: 18,
    marginBottom: 0,
    color:'black',
    textAlign:'center',
    fontWeight:'700',
  },
  choicesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  choiceButton: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 50, 
    marginHorizontal: 5,
    width: 50, 
    height: 50,
    justifyContent: 'center', 
    alignItems: 'center',
  },
  choiceText: {
    color: 'black',
    fontSize: 18,
    fontWeight:'bold',
  },
  resultsContainer: {
    justifyContent: 'center',
    padding: 20,
  },  
  results: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white',
  },
  score: {
    fontSize: 18,
    marginTop: 10,
    color: 'black',
    textAlign:'center',
  },
  analysisContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
  },
  interpretation: {
    fontSize: 16,
    textAlign: 'center',
    color: 'black',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10, 
    padding: 18, 
  },  
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: 'black',
  },
  chart: {
    borderRadius: 16,
  },
  restartButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
  },
  restartButtonText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
  },
});

export default IshiharaTest;
