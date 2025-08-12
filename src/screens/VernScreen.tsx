import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { Alert } from 'react-native';
import axios from 'axios';


type RootStackParamList = {
    Vern: undefined;
    VernScreen: { nomina: string }
    Vernier6Screen: { nomina: string }
    Vernier12Screen: { nomina: string }
};

type VernScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Vern'>;

interface Props {
    navigation: VernScreenNavigationProp;
}

const VernScreen: React.FC<Props> = ({ navigation }) => {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const loadUserData = async () => {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                setUser(JSON.parse(userData));
            }
        };

        loadUserData();
    }, []);

    if (!user) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Cargando datos del usuario...</Text>
            </View>
        );
    }

    const handleVer6 = async () => {
        try {
            const response = await axios.get('http://192.168.16.146:3003/api/calibraciones/historicoVer');
            if (response.status !== 200) {
                throw new Error('No se pudo procesar el histórico');
            }

            navigation.navigate('Vernier6Screen', { nomina: user.Nomina });

        } catch (error) {
            console.error('Error al procesar el histórico:', error);
            Alert.alert('Hubo un problema al procesar el histórico. Intenta nuevamente.');
        }
    };


    const handleVer12 = async () => {
        try {
            const response = await axios.get('http://192.168.16.146:3003/api/calibraciones/historicoVer12');
            if (response.status !== 200) {
                throw new Error('No se pudo procesar el histórico');
            }

            navigation.navigate('Vernier12Screen', { nomina: user.Nomina });

        } catch (error) {
            console.error('Error al procesar el histórico:', error);
            Alert.alert('Hubo un problema al procesar el histórico. Intenta nuevamente.');
        }
    };



    return (
        <ImageBackground
            source={require('./assets/BG6.jpg')}
            style={styles.container}
        >
            <View style={styles.container}>
                <Text style={styles.welcomeText}> {user.Nomina}     {user.Nombre}</Text>

                <Text style={styles.subtitle}>Selecciona el Vernier</Text>

                <View style={styles.containerButtons}>
                    <TouchableOpacity style={styles.optionButton}
                        onPress={handleVer6}>
                        <Image
                            source={require('./assets/vernier.png')}
                            style={styles.buttonImageG}
                            resizeMode="contain"
                        />
                        <Text style={styles.buttonText}>Vernier 6</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.optionButton}
                        onPress={handleVer12}>
                        <Image
                            source={require('./assets/Vernier12.png')}
                            style={styles.buttonImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.buttonText}>Vernier 12</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 2,
        paddingHorizontal: 1,
    },
    header: {
        alignItems: 'center',
        marginBottom: 1,
    },
    title: {
        marginTop: 1,
        fontSize: 30,
        color: '#333',
        fontFamily: 'Gayathri-Bold'
    },
    subtitle: {
        fontSize: 22,
        color: 'black',
        alignSelf: 'flex-start',
        marginLeft: 50,
        marginBottom: 1,
        fontFamily: 'Gayathri-Regular',
        marginTop: 10
    },
    welcomeText: {
        fontSize: 12,
        color: 'black',
        marginBottom: 1,
        marginTop: 5,
        fontFamily: 'Gayathri-Regular'
    },
    loadingText: {
        fontSize: 18,
        textAlign: 'center',
        color: '#333',
    },
    image: {
        width: '60%',
        height: '25%',
        aspectRatio: 1,
        marginTop: 200,
    },
    containerButtons: {
        marginTop: 1
    },
    optionButton: {
        width: 400,
        height: '45%',
        backgroundColor: 'rgba(229, 232, 234)',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        marginHorizontal: 15,
        marginBottom: 10
    },
    buttonText: {
        color: 'black',
        fontSize: 24,
        fontFamily: 'Gayathri-Regular',
    },
    buttonImage: {
        width: '90%',
        height: '80%',
        borderRadius: 10,
    },
    buttonImageG: {
        width: '100%',
        height: '70%',
        borderRadius: 10,
    },

});

export default VernScreen;