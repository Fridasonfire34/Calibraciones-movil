import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    TextInput,
    FlatList
} from 'react-native';
import axios from 'axios';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from './App';
import { Alert } from 'react-native';

type Props = StackScreenProps<RootStackParamList, 'FlexScreen'>;

interface Equipos {
    ID: string;
}

const FlexScreen: React.FC<Props> = ({ route, navigation }) => {
    const { nomina } = route.params;

    const [equipos, setEquipos] = useState<Equipos[]>([]);
    const [filteredEquipos, setFilteredEquipos] = useState<Equipos[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedItems, setSelectedItems] = useState<Equipos[]>([]);
    const [searchText, setSearchText] = useState<string>('');
    const [isSearchActive, setIsSearchActive] = useState(false);

    useEffect(() => {
        const fetchEquipos = async () => {
            setLoading(true);
            try {
                const response = await axios.get('http://192.168.16.146:3002/api/calibraciones/flexometros');
                setEquipos(response.data);
                setFilteredEquipos(response.data);
            } catch (error: any) {
                let errorMessage = '';
                if (error.response) {
                    errorMessage = `Error ${error.response.status}: ${error.response.data || 'No hay detalles disponibles'}`;
                } else if (error.request) {
                    errorMessage = 'No se recibió respuesta del servidor.';
                } else {
                    errorMessage = `Error en la solicitud: ${error.message}`;
                }
                Alert.alert('Error al obtener los Equipos', errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchEquipos();
    }, []);

    const handleSearch = (text: string) => {
        setSearchText(text);
        const trimmedText = text.trim().toLowerCase();
        setIsSearchActive(trimmedText.length > 0);

        const filtered = equipos.filter(item =>
            item.ID.toLowerCase().includes(trimmedText)
        );
        setFilteredEquipos(filtered);
    };

    const toggleSelectItem = (item: Equipos) => {
        setSelectedItems(prev => {
            const isSelected = prev.some(selected => selected.ID === item.ID);
            return isSelected ? [] : [item];
        });
    };

    const handleCalibrar = async () => {
        if (selectedItems.length === 0) return;

        const selectedEquipo = selectedItems[0];

        try {
            const response = await axios.get(`http://192.168.16.146:3002/api/calibraciones/flexometros/${selectedEquipo.ID}`);
            const siguienteCalibracion = response.data["Siguiente Calibracion"];

            if (siguienteCalibracion) {
                const fechaCalibracion = new Date(siguienteCalibracion);
                const fechaHoy = new Date();

                if (fechaCalibracion > fechaHoy) {
                    const formattedDate = fechaCalibracion.toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'numeric'
                    });

                    Alert.alert(
                        'Calibración programada',
                        `La calibración programada de este equipo es en: ${formattedDate}. Aún no es necesario calibrarlo.`,
                        [
                            { text: 'OK', style: 'cancel' },
                            {
                                text: 'Calibrar Equipo',
                                onPress: () => {
                                    navigation.navigate('CalibrarFScreen', {
                                        equipo: selectedEquipo.ID,
                                        nomina: nomina,
                                    });
                                },
                            },
                        ]
                    );
                    return;
                }
            }

            navigation.navigate('CalibrarFScreen', {
                equipo: selectedEquipo.ID,
                nomina: nomina,
            });
        } catch (error) {
            console.error('Error al verificar la calibración:', error);
            Alert.alert('Error', 'No se pudo verificar la fecha de calibración.');
        }
    };


    const renderItem = ({ item }: { item: Equipos }) => {
        const isSelected = selectedItems.some(selected => selected.ID === item.ID);

        return (
            <TouchableOpacity
                style={[styles.tableRow, isSelected && styles.selectedRow]}
                onPress={() => toggleSelectItem(item)}
            >
                <Text style={styles.tableText}>{item.ID}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <ImageBackground
            source={require('./assets/BG6.jpg')}
            resizeMode="cover"
            style={styles.container}
        >
            <View style={styles.topContainer}>
                <Text style={styles.userText}>{nomina}</Text>
                <Text style={styles.title}>Flexómetros</Text>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={searchText}
                        onChangeText={handleSearch}
                        placeholder="Buscar equipo"
                    />
                </View>
            </View>

            <View style={styles.contentContainer}>
                <View style={styles.listContainer}>
                    <FlatList
                        data={filteredEquipos}
                        keyExtractor={(item) => item.ID}
                        renderItem={renderItem}
                        style={{ width: '100%' }}
                    />
                </View>

                {/* Botón fijo al fondo */}
                {selectedItems.length > 0 && (
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.calibrarButton}
                            onPress={handleCalibrar}
                        >
                            <Text style={styles.buttonText}>Calibrar equipo</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 2,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    topContainer: {
        marginTop: 1,
        alignItems: 'center',
        width: '100%',
    },
    title: {
        fontSize: 24,
        fontFamily: 'Gayathri-Regular',
        marginBottom: 2,
        color: '#333',
    },
    userText: {
        fontSize: 12,
        color: 'black',
        marginBottom: 3,
        fontFamily: 'Gayathri-Regular',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
        width: '90%',
        justifyContent: 'center',
        marginBottom: 5
    },
    input: {
        width: '90%',
        height: 50,
        borderColor: '#c4c4c4',
        backgroundColor: '#fff',
        borderWidth: 1,
        paddingLeft: 10,
        fontSize: 16,
        borderRadius: 5,
        fontFamily: 'Gayathri-Regular'
    },
    tableRow: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        width: '100%',
        fontFamily: 'Gayathri-Regular',
    },
    tableText: {
        fontSize: 18,
        color: 'black',
        fontFamily: 'Gayathri-Regular',
    },
    selectedRow: {
        backgroundColor: '#b5d0e7ff'
    },
    calibrarButton: {
        position: 'absolute',
        bottom: 10,
        backgroundColor: '#0d5ed1',
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 10,
        elevation: 5,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        width: '90%',
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
    contentContainer: {
        flex: 1,
        width: '100%',
        justifyContent: 'space-between',
    },

    listContainer: {
        flex: 0.9,
        width: '100%',
    },
    buttonContainer: {
        flex: 0.1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },

});

export default FlexScreen;