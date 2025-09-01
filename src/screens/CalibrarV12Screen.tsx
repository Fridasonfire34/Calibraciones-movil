import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ImageBackground, Image, TextInput, Button, TouchableOpacity, Alert, Dimensions, useWindowDimensions, ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from './App';
import moment from 'moment';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

type Props = StackScreenProps<RootStackParamList, 'CalibrarV12Screen'>;

const CalibrarV12Screen: React.FC<Props> = ({ route }) => {
    const [dateNow, setDateNow] = useState('');
    const [nextCalibration, setNextCalibration] = useState('');
    const [estatus, setEstatus] = useState('OK');
    const [dimensiones, setDimensiones] = useState(Array(6).fill(''));
    const [patron, setPatron] = useState('');
    const [comentarios, setComentarios] = useState('');
    const navigation = useNavigation();
    const [dimensionesFuera, setDimensionesFuera] = useState<boolean[]>(Array(6).fill(false));
    const { width, height } = useWindowDimensions();
    const { equipo, nomina } = route.params;

    const tolerances = [
        { min: 0.999, max: 1.001 },
        { min: 1.999, max: 2.001 },
        { min: 2.999, max: 3.001 },
        { min: 0.999, max: 1.001 },
        { min: 1.999, max: 2.001 },
        { min: 2.999, max: 3.001 }
    ];

    useEffect(() => {
        const now = moment();
        const next = moment().add(90, 'days');
        setDateNow(now.format('YYYY-MM-DD'));
        setNextCalibration(next.format('YYYY-MM'));
        setPatron('I-CAL-020');
    }, []);

    const handleChangeDimension = (index: number, value: string) => {
        const updated = [...dimensiones];
        updated[index] = value;
        setDimensiones(updated);
    };

    const isFormValid = () => {
        return dimensiones.every((d) => d.trim() !== '');
    };

    const handleGuardar = async () => {
        const nuevasFuera = Array(6).fill(false);
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
                    ? `La dimensión ${fueraIndices[0]} está fuera de tolerancia. El estatus se asignara como 'NO OK', ¿Deseas continuar?`
                    : `Las dimensiones ${fueraIndices.join(', ')} están fuera de tolerancia. El estatus se asignara como 'NO OK', ¿Deseas continuar?`;

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
            const response = await fetch('http://192.168.16.146:3002/api/calibraciones/calibracionVer12', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error(`Error al guardar: ${response.statusText}`);
            const data = await response.json();
            console.log('Calibración guardada:', data);

            const updateResponse = await fetch('http://192.168.16.146:3002/api/calibraciones/vernier12', {
                method: 'GET',
            });

            if (!updateResponse.ok) throw new Error('Error al actualizar la tabla');

            const flexometrosData = await updateResponse.json();
            console.log('Tabla de Vernier 12 actualizada:', flexometrosData);

            Alert.alert('Éxito', 'Calibración registrada correctamente', [
                {
                    text: 'OK',
                    onPress: () => {
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Inicio' }],
                        });
                    }
                },
            ]);
        } catch (error) {
            console.error(' Error:', error);
            Alert.alert('Error al guardar la calibración.');
        }
    };

    return (
        <ImageBackground source={require('./assets/cats.jpg')} resizeMode="cover" style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardAvoiding}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.topContainer}>
                        <Text style={styles.subtitle}>{nomina}</Text>
                        <View style={styles.equipoRow}>
                            <Text style={styles.title}>{equipo}</Text>
                            <Image source={require('./assets/Vernier12.png')} style={styles.equipoIcon} resizeMode="contain" />
                        </View>
                        <Text style={styles.tolerance}>Tolerancia: ± 0.001"</Text>
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

                        <View style={{ width: '48%' }}>
                            <Text style={styles.dimensionLabel}>Patrón de Verificación:</Text>
                            <Text style={styles.inputPatron}>{'I-CAL-003'}</Text>
                        </View>

                        <Text style={styles.label}>Comentarios:</Text>
                        <TextInput
                            style={[styles.inputComent, { width: width * 0.9 }]}
                            value={comentarios}
                            onChangeText={setComentarios}
                            placeholder="Escribe algún comentario..."
                            multiline
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
        padding: 5,
        paddingBottom: 60,
        flexGrow: 1,
    },
    container: {
        flex: 1,
        padding: 10,
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
        gap: 4,
        marginTop: 1,
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
        marginBottom: 1,
    },
    labelDate: {
        fontSize: 16,
        fontFamily: 'Gayathri-Bold',
        marginTop: 7,
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
        textAlignVertical: 'center'
    },
    inputPatron: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 8,
        fontFamily: 'Gayathri-Regular',
        textAlign: 'center',
        fontSize: 14,
        textAlignVertical: 'center',
        backgroundColor: '#ccc'
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
        textAlignVertical: 'center',
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

export default CalibrarV12Screen;