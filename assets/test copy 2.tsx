import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView  } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

// const ishiharaPlates = [
//   { id: 1, image: require('./assets/plate1.png'), correctAnswer: '12' },
//   { id: 2, image: require('./assets/plate2.png'), correctAnswer: '8' },
//   { id: 3, image: require('./assets/plate3.png'), correctAnswer: '6' },
//   { id: 4, image: require('./assets/plate4.jpg'), correctAnswer: '29' },
//   { id: 5, image: require('./assets/plate5.jpg'), correctAnswer: '57' },
//   { id: 6, image: require('./assets/plate6.jpg'), correctAnswer: '5' },
//   { id: 7, image: require('./assets/plate7.jpg'), correctAnswer: '3' },
//   { id: 8, image: require('./assets/plate8.jpg'), correctAnswer: '15' },
//   { id: 9, image: require('./assets/plate9.jpg'), correctAnswer: '74' },
//   { id: 10, image: require('./assets/plate10.jpg'), correctAnswer: '2' },
//   { id: 11, image: require('./assets/plate11.jpg'), correctAnswer: '6' },
//   { id: 12, image: require('./assets/plate12.jpg'), correctAnswer: '97' },
//   { id: 13, image: require('./assets/plate13.jpg'), correctAnswer: '45' },
//   { id: 14, image: require('./assets/plate14.jpg'), correctAnswer: '5' },
//   { id: 15, image: require('./assets/plate15.jpg'), correctAnswer: '7' },
//   { id: 16, image: require('./assets/plate16.jpg'), correctAnswer: '16' },
//   { id: 17, image: require('./assets/plate17.jpg'), correctAnswer: '73' },
// ];

const ishiharaPlates = [
  { id: 1, image: require('./assets/plate1.png'), correctAnswer: '12', deficiencyType: 'red' },
  { id: 2, image: require('./assets/plate2.png'), correctAnswer: '8', deficiencyType: 'green' },
  { id: 3, image: require('./assets/plate3.png'), correctAnswer: '6', deficiencyType: 'red-green' },
  // ... Add deficiency types for all plates
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

  useEffect(() => {
    initializeTest();
  }, []);

  const initializeTest = () => {
    const shuffledPlates = [...ishiharaPlates].sort(() => Math.random() - 0.5);
    setPlates(shuffledPlates);
    setChoices(generateChoices(shuffledPlates[0].correctAnswer));
    setIsLoading(false);
  };

  const handleAnswer = (selectedAnswer: string) => {
    const currentPlate = plates[currentPlateIndex];
    if (selectedAnswer === currentPlate.correctAnswer) {
      setScore(score + 1);
    } else {
      // Increment deficiency score based on the plate type
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

  const renderTest = () => {
    if (isLoading || plates.length === 0) {
      return <Text>Loading...</Text>;
    }

    return (
      <View>
        <Image source={plates[currentPlateIndex].image} style={styles.image} />
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

  const renderResults = () => (
    <ScrollView contentContainerStyle={styles.resultsContainer}>
    <Text style={styles.results}>Test Completed!</Text>
    <Text style={styles.score}>Your Score: {score} / {plates.length}</Text>
    <View style={styles.analysisContainer}>
      <Text style={styles.analysisTitle}>Analysis:</Text>
      <Text style={styles.interpretation}>{analyzeDeficiency()}</Text>
    </View>
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Color Deficiency Distribution</Text>
      <PieChart
        data={[
          { name: 'Red', population: deficiencyScore.red, color: 'rgba(255, 0, 0, 0.7)', legendFontColor: '#7F7F7F', legendFontSize: 12 },
          { name: 'Green', population: deficiencyScore.green, color: 'rgba(0, 255, 0, 0.7)', legendFontColor: '#7F7F7F', legendFontSize: 12 },
          { name: 'Yellow', population: deficiencyScore.yellow, color: 'rgba(255, 255, 0, 0.7)', legendFontColor: '#7F7F7F', legendFontSize: 12 },
        ]}
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
        paddingLeft="15"
        absolute
        style={styles.chart}
      />
    </View>
    <TouchableOpacity style={styles.restartButton} onPress={restartTest}>
      <Text style={styles.restartButtonText}>Restart Test</Text>
    </TouchableOpacity>
  </ScrollView>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ISHIHARA TEST</Text>
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
  image: {
    width: 240,
    height: 240,
    resizeMode: 'contain',
    marginBottom: 20,
    borderRadius: 10
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
  // results: {
  //   fontSize: 22,
  //   fontWeight: 'bold',
  //   marginBottom: 10,
  //   color:'white',
  //   textAlign: 'center',
  // },
  // score: {
  //   fontSize: 18,
  //   marginBottom: 10,
  //   color:'white',
  //   textAlign: 'center',
  // },
  // interpretation: {
  //   fontSize: 16,
  //   marginBottom: 20,
  //   textAlign: 'center',
  //   color:'white',
  // },
  // restartButton: {
  //   backgroundColor: '#007AFF',
  //   padding: 10,
  //   borderRadius: 5,
  // },
  // restartButtonText: {
  //   color: 'white',
  //   fontSize: 16,
  //   textAlign: 'center',
  // },  

  //MAMA MO
  //dsadasddasdasdasd
  resultsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  analysisContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginVertical: 15,
    width: '90%',
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  interpretation: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
  },
  chartContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  results: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
    textAlign: 'center',
  },
  score: {
    fontSize: 20,
    marginBottom: 15,
    color: 'white',
    textAlign: 'center',
  },
  restartButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
  },
  restartButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default IshiharaTest;