import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ImageBackground, Image, TextInput, Button, TouchableOpacity, Alert, Dimensions, useWindowDimensions, ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from './App';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';

type RootStackParamList = {
    FlexScreen: { nomina: string }
    Vernier6Screen: { nomina: string }
    Vernier12Screen: { nomina: string }
};

type Vernier12ScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Vernier12Screen'>;

const Vernier12Screen: React.FC<Props> = ({ route }) => {
    const [dateNow, setDateNow] = useState('');
    const [nextCalibration, setNextCalibration] = useState('');
    const [estatus, setEstatus] = useState('OK');
    const [dimensiones, setDimensiones] = useState(Array(7).fill(''));
    const [patron, setPatron] = useState('');
    const [comentarios, setComentarios] = useState('');
    const navigation = useNavigation();
    const [dimensionesFuera, setDimensionesFuera] = useState<boolean[]>(Array(7).fill(false));
    const { width, height } = useWindowDimensions();
    const { equipo, nomina } = route.params;

    const tolerances = [
        { min: 1.38, max: 2.62 },
        { min: 9.38, max: 10.62 },
        { min: 19.38, max: 20.62 },
        { min: 29.38, max: 30.62 },
        { min: 39.38, max: 40.62 },
        { min: 79.38, max: 80.62 },
        { min: 119.38, max: 120.62 },
    ];

    useEffect(() => {
        const now = moment();
        const next = moment().add(90, 'days');
        setDateNow(now.format('YYYY-MM-DD'));
        setNextCalibration(next.format('YYYY-MM-DD'));
    }, []);

    const handleChangeDimension = (index: number, value: string) => {
        const updated = [...dimensiones];
        updated[index] = value;
        setDimensiones(updated);
    };

    const isFormValid = () => {
        return dimensiones.every((d) => d.trim() !== '') && patron.trim() !== '';
    };

    const handleGuardar = async () => {
        const nuevasFuera = Array(7).fill(false);
        const fueraIndices: number[] = [];

        dimensiones.forEach((valor, index) => {
            const num = parseFloat(valor);
            const { min, max } = tolerances[index];
            if (num < min || num > max) {
                nuevasFuera[index] = true;
                fueraIndices.push(index + 1);
            }
        });

        setDimensionesFuera(nuevasFuera);

        if (fueraIndices.length > 0) {
            const mensaje =
                fueraIndices.length === 1
                    ? `La dimensión ${fueraIndices[0]} está fuera de tolerancia. ¿Deseas continuar?`
                    : `Las dimensiones ${fueraIndices.join(', ')} están fuera de tolerancia. ¿Deseas continuar?`;

            Alert.alert(
                'Fuera de tolerancia',
                mensaje,
                [
                    { text: 'NO', style: 'cancel' },
                    { text: 'SI', onPress: () => guardarConEstado('NO OK') },
                ]
            );
        } else {
            guardarConEstado(estatus);
        }
    };

    const guardarConEstado = async (estatusFinal: string) => {
        const payload = {
            nomina,
            equipo,
            fecha: dateNow,
            dimensiones,
            estatus: estatusFinal,
            patron,
            siguienteCalibracion: nextCalibration,
            comentarios,
        };

        try {
            const response = await fetch('http://10.0.2.2:3003/api/calibracionVer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error(`Error al guardar: ${response.statusText}`);
            const data = await response.json();
            console.log('Calibración guardada:', data);

            const updateResponse = await fetch('http://10.0.2.2:3003/api/vernier', {
                method: 'GET',
            });

            if (!updateResponse.ok) throw new Error('Error al actualizar la tabla');

            const flexometrosData = await updateResponse.json();
            console.log('Tabla de flexómetros actualizada:', flexometrosData);

            Alert.alert('Éxito', 'Calibración registrada correctamente', [
                {
                    text: 'OK',
                    onPress: () => navigation.navigate('FlexScreen', { nomina }),
                },
            ]);
        } catch (error) {
            console.error(' Error:', error);
            Alert.alert('Error al guardar la calibración.');
        }
    };

    return (
        <ImageBackground
            source={require('./assets/cats.jpg')}
            resizeMode="cover"
            style={styles.container}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.keyboardAvoiding}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.topContainer}>
                        <Text style={styles.subtitle}>{nomina}</Text>
                        <View style={styles.equipoRow}>
                            <Text style={styles.title}>{equipo}</Text>
                            <Image
                                source={require('./assets/flex.png')}
                                style={styles.equipoIcon}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.tolerance}>Tolerancia: ± 0.62"</Text>
                        <Text style={styles.labelDate}>Fecha: {dateNow}</Text>

                        <View style={[styles.dimensionContainer, { width: width * 0.8 }]}>
                            {dimensiones.map((value, index) => (
                                <View key={index} style={styles.dimensionRow}>
                                    <Text style={styles.dimensionLabel}>Dimensión {index + 1}:</Text>
                                    <TextInput
                                        style={[
                                            styles.inputDim,
                                            (parseFloat(value) < tolerances[index].min || parseFloat(value) > tolerances[index].max) && { backgroundColor: '#f8d7da' },
                                        ]}
                                        value={value}
                                        onChangeText={(text) => handleChangeDimension(index, text)}
                                        keyboardType="numeric"
                                    />
                                </View>
                            ))}
                        </View>

                        <Text style={styles.label}>Comentarios:</Text>
                        <TextInput
                            style={[styles.inputComent, { width: width * 0.9 }]}
                            value={comentarios}
                            onChangeText={setComentarios}
                            placeholder="Escribe algún comentario..."
                            multiline
                        />

                        <Text style={styles.label}>Patrón de Verificación:</Text>
                        <TextInput
                            style={[styles.input, { width: width * 0.8 }]}
                            value={patron}
                            onChangeText={setPatron}
                        />

                        <Text style={styles.label}>Siguiente Calibración: {nextCalibration}</Text>

                        <TouchableOpacity
                            style={[styles.GuardarButton, !isFormValid() && styles.disabledButton]}
                            onPress={handleGuardar}
                            disabled={!isFormValid()}
                        >
                            <Text style={styles.buttonText}>Guardar calibracion</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    keyboardAvoiding: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 120,
        flexGrow: 1,
    },
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    topContainer: {
        //  marginTop: 1,
        alignItems: 'center',
        width: '100%',
    },
    title: {
        fontSize: 24,
        fontFamily: 'Gayathri-Bold',
    },
    subtitle: {
        fontSize: 12,
        fontFamily: 'Gayathri-Regular',
    },
    equipoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 2,
    },
    equipoIcon: {
        width: 70,
        height: 70,
        marginLeft: 8,
    },
    tolerance: {
        fontSize: 18,
        color: '#333',
        fontFamily: 'Gayathri-Regular',
    },
    label: {
        fontSize: 16,
        fontFamily: 'Gayathri-Bold',
        marginTop: 5,
        marginBottom: 4,
    },
    labelDate: {
        fontSize: 16,
        fontFamily: 'Gayathri-Bold',
        marginTop: 10,
        marginBottom: 4,
    },
    dimensionContainer: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        alignContent: 'center',
        marginLeft: 10,
    },
    dimensionRow: {
        width: '48%',
        marginBottom: 10,
    },
    dimensionLabel: {
        fontSize: 14,
        marginBottom: 4,
        fontFamily: 'Gayathri-Bold',
    },
    inputDim: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 8,
        fontFamily: 'Gayathri-Regular',
        textAlign: 'center',
        fontSize: 14,
    },
    inputComent: {
        height: 100,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        fontFamily: 'Gayathri-Regular',
        //   backgroundColor: 'white',
        marginTop: 2,
        textAlign: 'center',
        fontSize: 14,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        fontFamily: 'Gayathri-Regular',
        textAlign: 'center',
        fontSize: 14,
    },
    GuardarButton: {
        position: 'absolute',
        bottom: -100,
        backgroundColor: '#2d5f90',
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 10,
        elevation: 5,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        width: '90%',
        alignSelf: 'center',
    },
    disabledButton: {
        backgroundColor: '#cccccc',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
        fontFamily: 'Gayathri-Regular',
    },
});

export default Vernier12Screen;