import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { Alert } from 'react-native';


type RootStackParamList = {
    Inicio: undefined;
    FlexScreen: { nomina: string };
    VernScreen: { nomina: string };
    TransportadorScreen: { nomina: string }
    OtrosScreen: { nomina: string }
};

type InicioScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Inicio'>;

interface Props {
    navigation: InicioScreenNavigationProp;
}

const InicioScreen: React.FC<Props> = ({ navigation }) => {
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

    const handleFlex = async () => {
        try {
            const response = await fetch('http://10.0.2.2:3003/api/historicoFlex');
            if (!response.ok) {
                throw new Error('No se pudo procesar el histórico');
            }

            navigation.navigate('FlexScreen', { nomina: user.Nomina });

        } catch (error) {
            console.error('Error al procesar el histórico:', error);
            Alert.alert('Hubo un problema al procesar el histórico. Intenta nuevamente.');
        }
    };


    const handleVer = () => {
        navigation.navigate('VernScreen', { nomina: user.Nomina });
    };

    const handleTrans = async () => {
        try {
            const response = await fetch('http://10.0.2.2:3003/api/historicoTransportador');
            if (!response.ok) {
                throw new Error('No se pudo procesar el histórico');
            }

            navigation.navigate('TransportadorScreen', { nomina: user.Nomina });

        } catch (error) {
            console.error('Error al procesar el histórico:', error);
            Alert.alert('Hubo un problema al procesar el histórico. Intenta nuevamente.');
        }
    };

    const handleOtros = async () => {
        try {
            const response = await fetch('http://10.0.2.2:3003/api/historicoOtros');
            if (!response.ok) {
                throw new Error('No se pudo procesar el histórico');
            }

            navigation.navigate('OtrosScreen', { nomina: user.Nomina });

        } catch (error) {
            console.error('Error al procesar el histórico:', error);
            Alert.alert('Hubo un problema al procesar el histórico. Intenta nuevamente.');
        }
    };

    return (
        <ImageBackground
            source={require('./assets/BG6-New.jpg')}
            style={styles.container}
        >
            <View style={styles.container}>
                <Text style={styles.welcomeText}>{user.Nomina}     {user.Nombre}</Text>

                <View style={styles.header}>
                    <Text style={styles.title}>Nueva Calibración</Text>
                </View>

                <Text style={styles.subtitle}>Selecciona el equipo</Text>

                <View style={styles.buttonGroup}>
                    <View style={styles.row}>
                        <TouchableOpacity style={styles.optionButton} onPress={handleFlex}>
                            <Image
                                source={require('./assets/flex.png')}
                                style={styles.buttonImage}
                                resizeMode="contain"
                            />
                            <Text style={styles.buttonText}>Flexómetro</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.optionButton} onPress={handleVer}>
                            <Image
                                source={require('./assets/vernier.png')}
                                style={styles.buttonImage}
                                resizeMode="contain"
                            />
                            <Text style={styles.buttonText}>Vernier</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.row}>
                        <TouchableOpacity style={styles.optionButton} onPress={handleTrans}>
                            <Image
                                source={require('./assets/Transportador.png')}
                                style={styles.buttonImageG}
                                resizeMode="contain"
                            />
                            <Text style={styles.buttonText}>Transportador</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.optionButton} onPress={handleOtros}>
                            <Image
                                source={require('./assets/bascula.png')}
                                style={styles.buttonImageG}
                                resizeMode="contain"
                            />
                            <Text style={styles.buttonText}>Otros</Text>
                        </TouchableOpacity>
                    </View>
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
        paddingTop: 1,
        //  paddingHorizontal: 1,
    },
    header: {
        alignItems: 'center',
        marginBottom: 1,
    },
    title: {
        marginTop: 3,
        fontSize: 30,
        color: '#333',
        fontFamily: 'Gayathri-Bold',
    },
    subtitle: {
        fontSize: 22,
        color: 'black',
        alignSelf: 'flex-start',
        marginLeft: 50,
        marginBottom: 1,
        fontFamily: 'Gayathri-Regular',
    },
    welcomeText: {
        fontSize: 12,
        color: 'black',
        marginBottom: 1,
        fontFamily: 'Gayathri-Regular',
    },
    buttonGroup: {
        flex: 1,
        //width: '100%',
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        flex: 2,
    },
    optionButton: {
        flex: 1,
        backgroundColor: 'rgba(229, 232, 234)',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        marginHorizontal: 1,
    },
    buttonText: {
        color: 'black',
        fontSize: 24,
        fontFamily: 'Gayathri-Regular',
    },
    buttonImage: {
        width: '70%',
        height: '60%',
        borderRadius: 10,
    },
    buttonImageG: {
        width: '90%',
        height: '70%',
        borderRadius: 10,
    },

});

export default InicioScreen;