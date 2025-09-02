import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ImageBackground, TextInput, TouchableOpacity, Alert, ScrollView,
    KeyboardAvoidingView, Platform
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from './App';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';

type Props = StackScreenProps<RootStackParamList, 'CalibrarOtroScreen'>;

const CalibrarOtroScreen: React.FC<Props> = ({ route }) => {
    const { equipo, nomina } = route.params;
    const [nombreEquipo, setNombreEquipo] = useState('');
    const [patron, setPatron] = useState('');
    const [cantidadDimensiones, setCantidadDimensiones] = useState(0);
    const [dimensiones, setDimensiones] = useState<string[]>([]);
    const [dimensionesFuera, setDimensionesFuera] = useState<boolean[]>([]);
    const [verificaciones, setVerificaciones] = useState<string[]>([]);
    const [tolerancias, setTolerancias] = useState<{ min: number; max: number }[]>([]);
    const [tiempoCalibrado, setTiempoCalibrado] = useState<number | null>(null);
    const [comentarios, setComentarios] = useState('');
    const [dateNow, setDateNow] = useState('');
    const [toleranciaValor, setToleranciaValor] = useState<number | null>(null);
    const [nextCalibration, setNextCalibration] = useState('');
    const navigation = useNavigation();
    const [verificacionesNumericas, setVerificacionesNumericas] = useState<number[]>([]);

    useEffect(() => {
    const fetchEquipoInfo = async () => {
        try {
            const response = await fetch(`http://192.168.16.192:3002/api/calibraciones/herramientas/${equipo}`);
            const data = await response.json();

            setNombreEquipo(data.Equipo);
            setPatron(data.Patron);
            setCantidadDimensiones(data.Dimensiones);

            const verifs = [
                data["Verificacion 1"],
                data["Verificacion 2"],
                data["Verificacion 3"],
                data["Verificacion 4"],
                data["Verificacion 5"],
                data["Verificacion 6"],
                data["Verificacion 7"],
            ].filter((v) => v !== null && v !== undefined);
            setVerificaciones(verifs);

            const verifsNum = verifs.map((v) => parseFloat(v));
            setVerificacionesNumericas(verifsNum);

            const toleranciaBase = parseFloat(data.Tolerancia);
            setToleranciaValor(toleranciaBase);

            const toleranciasGeneradas = verifsNum.map((v) => ({
                min: v - toleranciaBase,
                max: v + toleranciaBase,
            }));
            setTolerancias(toleranciasGeneradas);

            setDimensiones(Array(data.Dimensiones).fill(''));
            setDimensionesFuera(Array(data.Dimensiones).fill(false));

            const now = moment();
            setDateNow(now.format('YYYY-MM-DD'));

            const dias = parseInt(data["Tiempo de Calibrado"]) || 365;
            setTiempoCalibrado(dias);
            
            const next = now.clone().add(dias, 'days');
            setNextCalibration(next.format('YYYY-MM'));

        } catch (error) {
            console.error("Error al cargar datos del equipo:", error);
            Alert.alert("Error", "No se pudieron cargar los datos del equipo.");
        }
    };

    fetchEquipoInfo();
}, []);


    const handleChangeDimension = (index: number, value: string) => {
    const updated = [...dimensiones];
    updated[index] = value;
    setDimensiones(updated);

    const num = parseFloat(value);
    const verif = verificacionesNumericas[index];
    const tolerancia = toleranciaValor ?? 0;

    const fuera = isNaN(num) || num < verif - tolerancia || num > verif + tolerancia;

    const updatedFuera = [...dimensionesFuera];
    updatedFuera[index] = fuera;
    setDimensionesFuera(updatedFuera);
};


    const isFormValid = () => dimensiones.every((d) => d.trim() !== '');

    const handleGuardar = () => {
        const nuevasFuera = Array(cantidadDimensiones).fill(false);
        const fueraIndices: number[] = [];

        dimensiones.forEach((valor, index) => {
            const num = parseFloat(valor);
            const tol = tolerancias[index];

            if (isNaN(num) || num < tol.min || num > tol.max) {
                nuevasFuera[index] = true;
                fueraIndices.push(index + 1);
            }
        });

        setDimensionesFuera(nuevasFuera);

        if (fueraIndices.length > 0) {
            Alert.alert(
                'Fuera de tolerancia',
                `Las dimensiones ${fueraIndices.join(', ')} están fuera de tolerancia. El estatus será 'NO OK'. ¿Deseas continuar?`,
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Sí', onPress: () => guardarConEstado('NO OK') }
                ]
            );
        } else {
            guardarConEstado('OK');
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
            const response = await fetch('http://192.168.16.192:3002/api/calibraciones/calibrarOtro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('Error al guardar calibración');

            Alert.alert('Éxito', 'Calibración registrada correctamente', [
                {
                    text: 'OK',
                    onPress: () => navigation.reset({
                        index: 0,
                        routes: [{ name: 'Inicio' }]
                    })
                }
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'No se pudo guardar la calibración');
        }
    };

return (
    <ImageBackground source={require('./assets/cats.jpg')} resizeMode="cover" style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.scroll}>
                 <View style={styles.topContainer}>
                <Text style={styles.subtitlenomina}>{nomina}</Text>
                <Text style={styles.title}>{equipo} - {nombreEquipo}</Text>
                <Text style={styles.tolerance}>Tolerancia: ± {toleranciaValor}</Text>
                <Text style={styles.date}>Fecha: {dateNow}</Text>
                </View>

                <View style={styles.dimensionContainer}>
                    {dimensiones.map((val, idx) => (
                        <View key={idx} style={styles.dimensionRow}>
                            <Text style={styles.dimensionLabel}>
                                Dimensión: {idx + 1}:
                            </Text>
                            <TextInput
                                value={val}
                                keyboardType="numeric"
                                onChangeText={(text) => handleChangeDimension(idx, text)}
                                style={[
                                    styles.inputDim,
                                    dimensionesFuera[idx] && { backgroundColor: '#f8d7da' }
                                ]}
                            />
                        </View>
                    ))}
                </View>
                
                <View style={styles.centeredSection}>
                <View style={{ width: '48%' }}>
                    <Text style={styles.dimensionLabel}>Patrón de Verificación:</Text>
                      <Text style={styles.inputPatron}>{patron}</Text>
                </View>


                <Text style={styles.label}>Comentarios:</Text>
                </View>
                <TextInput
                    style={styles.inputComent}
                    value={comentarios}
                    onChangeText={setComentarios}
                    multiline
                    placeholder="Escribe algún comentario"
                />
<View style={styles.centeredSection}>
                    <Text style={styles.label}>Siguiente Calibración: {nextCalibration}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.GuardarButton, !isFormValid() && styles.disabledButton]}
                    disabled={!isFormValid()}
                    onPress={handleGuardar}
                >
                    <Text style={styles.buttonText}>Guardar Calibración</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    </ImageBackground>
);

};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: 20 },
    title: {
        fontSize: 24,
        marginBottom: 5,
        fontFamily: 'Gayathri-Bold',
    },
     topContainer: {
        //  marginTop: 1,
        alignItems: 'center',
        width: '100%',
    },
    subtitle: {
        fontSize: 18,
        marginBottom: 5,
        fontFamily: 'Gayathri-Regular',
    },
    subtitlenomina: {
        fontSize: 12,
        fontFamily: 'Gayathri-Regular',
    },
    date: {
        fontSize: 16,
        fontFamily: 'Gayathri-Bold',
        marginTop: 10,
        marginBottom: 4,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
        fontFamily: 'Gayathri-Regular',
    },
    label: {
        fontSize: 16,
        fontFamily: 'Gayathri-Bold',
        marginTop: 5,
        marginBottom: 1,
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
        backgroundColor: 'white',
    },
    button: {
        marginTop: 20,
        backgroundColor: '#2d5f90',
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 10,
        elevation: 5,
        width: '100%',
        alignSelf: 'center',
    },
    disabledButton: {
        backgroundColor: '#cccccc',
    },
    inputGroup: {
        marginBottom: 15,
    },
    tolerance: {
        fontSize: 18,
        color: '#333',
        fontFamily: 'Gayathri-Regular',
    },
    textarea: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        minHeight: 80,
        textAlignVertical: 'top',
        fontFamily: 'Gayathri-Regular',
        backgroundColor: 'white',
    },
    centeredSection: {
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
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
inputComent: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontFamily: 'Gayathri-Regular',
    marginTop: 2,
    textAlignVertical: 'center',
    fontSize: 14,
    backgroundColor: 'white',
},
GuardarButton: {
    marginTop: 20,
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

});

export default CalibrarOtroScreen;
