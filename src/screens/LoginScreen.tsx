import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    Animated,
    Image,
    Alert
} from 'react-native';
import logo from './assets/tm-logo-opacity.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
    Login: undefined;
    Inicio: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
    navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
    const [nomina, setNomina] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [focusNomina, setFocusNomina] = useState(false);
    const passwordRef = useRef<TextInput>(null);
    const [focusPassword, setFocusPassword] = useState(false);

    const animNomina = useRef(new Animated.Value(nomina ? 1 : 0)).current;
    const animPassword = useRef(new Animated.Value(password ? 1 : 0)).current;

    const handleFocus = (field: string) => {
        if (field === 'nomina') {
            setFocusNomina(true);
            Animated.timing(animNomina, {
                toValue: 1,
                duration: 200,
                useNativeDriver: false
            }).start();
        } else {
            setFocusPassword(true);
            Animated.timing(animPassword, {
                toValue: 1,
                duration: 200,
                useNativeDriver: false
            }).start();
        }
    };

    const handleBlur = (field: string) => {
        if (field === 'nomina' && !nomina) {
            setFocusNomina(false);
            Animated.timing(animNomina, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false
            }).start();
        } else if (field === 'password' && !password) {
            setFocusPassword(false);
            Animated.timing(animPassword, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false
            }).start();
        }
    };

    const getLabelStyle = (animation: Animated.Value) => ({
        position: 'absolute' as const,
        left: 10,
        top: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [18, -30]
        }),
        fontSize: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [18, 14]
        }),
        color: '#666',
        paddingHorizontal: 1,
        fontFamily: 'Gayathri-Regular'
    });

    const handleLogin = async () => {
        try {
            setError('');

            const response = await fetch('http://192.168.16.146:3002/api/calibraciones/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nomina: nomina,
                    password: password,
                }),
            });

            if (response.ok) {
                const data = await response.json();

                await AsyncStorage.setItem('user', JSON.stringify(data.user));
                setNomina('');
                setPassword('');

                navigation.navigate('Inicio');
            } else if (response.status === 401) {
                const errorData = await response.json();
                Alert.alert(errorData.message || 'Credenciales incorrectas', 'El usuario o la contraseña son incorrectos');
            } else {
                const errorData = await response.json();
                Alert.alert(errorData.message || 'Error en el servidor', 'No hay conexion, favor de reportarlo');
            }
        } catch (err) {
            console.log("Error:", err);
            Alert.alert('No se pudo conectar al servidor. Revisa tu conexión.');
        }
    };

    return (
        <ImageBackground
            source={require('./assets/cats.jpg')}
            resizeMode="cover"
            style={styles.container}
        >
            <View style={styles.header}>
                <Text style={styles.title}>Calibraciones</Text>
            </View>

            <Text style={styles.subtitle}>Login</Text>
            <View style={styles.inputContainer}>
                <View style={{ width: '95%', marginBottom: 40 }}>

                    <Animated.Text style={getLabelStyle(animNomina)}>Nómina</Animated.Text>
                    <TextInput
                        style={styles.input}
                        value={nomina}
                        onChangeText={setNomina}
                        onFocus={() => handleFocus('nomina')}
                        onBlur={() => handleBlur('nomina')}
                        placeholder={focusNomina ? '' : 'Nómina'}
                        onSubmitEditing={() => passwordRef?.current?.focus()}
                    />
                </View>

                <View style={{ width: '95%', marginBottom: 20 }}>
                    <Animated.Text style={getLabelStyle(animPassword)}>Password</Animated.Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        ref={passwordRef}
                        onChangeText={setPassword}
                        onFocus={() => handleFocus('password')}
                        onBlur={() => handleBlur('password')}
                        placeholder={focusPassword ? '' : 'Password'}
                        onSubmitEditing={handleLogin}
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>→</Text>
                </TouchableOpacity>
            </View>
            <Image style={{ marginTop: 50, width: 200, height: 50 }} source={logo} />
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 100,
        paddingHorizontal: 40,
        backgroundColor: 'white',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        marginTop: 10,
        fontSize: 30,
        color: '#333',
        fontFamily: 'Poppins-Regular'
    },
    subtitle: {
        fontSize: 22,
        color: '#666',
        alignSelf: 'flex-start',
        marginLeft: 15,
        marginBottom: 50,
        fontFamily: 'Gayathri-Regular'
    },
    inputContainer: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 0.7,
    },
    input: {
        width: '100%',
        height: 65,
        borderColor: '#e2e0e0',
        borderWidth: 2,
        paddingLeft: 10,
        borderRadius: 10,
        backgroundColor: 'white',
        color: 'black',
        fontFamily: 'Gayathri-Regular',
        fontSize: 14
    },
    button: {
        marginTop: 30,
        width: 70,
        height: 70,
        borderRadius: 40,
        backgroundColor: '#3b7fb8',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-end',
        marginRight: 20
    },
    buttonText: {
        fontSize: 30,
        color: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },

});

export default LoginScreen;
