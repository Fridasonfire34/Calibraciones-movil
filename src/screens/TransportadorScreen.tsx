import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    Alert,
    TextInput,
    FlatList
} from 'react-native';
import axios from 'axios';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from './App';

type Props = StackScreenProps<RootStackParamList, 'TransportadorScreen'>;

interface Equipos {
    ID: string;
}

const TransportadorScreen: React.FC<Props> = ({ route, navigation }) => {
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
                const response = await axios.get('http://10.0.2.2:3003/api/transportador');
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

    const handleCalibrar = () => {
        if (selectedItems.length > 0) {
            const selectedEquipo = selectedItems[0]; // suponemos que solo uno se puede seleccionar
            navigation.navigate('CalibrarTransportadorScreen', {
                equipo: selectedEquipo.ID,
                nomina: nomina
            });
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
            source={require('./assets/cats.jpg')}
            resizeMode="cover"
            style={styles.container}
        >
            <View style={styles.topContainer}>
                <Text style={styles.userText}>{nomina}</Text>
                <Text style={styles.title}>Transportadores</Text>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={searchText}
                        onChangeText={handleSearch}
                        placeholder="Buscar equipo"
                    />
                </View>

                <FlatList
                    data={filteredEquipos}
                    keyExtractor={(item) => item.ID}
                    renderItem={renderItem}
                    style={{ width: '100%' }}
                />
            </View>
            {selectedItems.length > 0 && (
                <TouchableOpacity
                    style={[styles.calibrarButton, selectedItems.length === 0 && styles.disabledButton]}
                    onPress={handleCalibrar}
                    disabled={selectedItems.length === 0}
                >
                    <Text style={styles.buttonText}>Calibrar equipo</Text>
                </TouchableOpacity>
            )}

        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    topContainer: {
        marginTop: 10,
        alignItems: 'center',
        width: '100%',
    },
    title: {
        fontSize: 24,
        fontFamily: 'Gayathri-Regular',
        marginBottom: 10,
        color: '#333',
    },
    userText: {
        fontSize: 12,
        color: 'black',
        marginBottom: 5,
        fontFamily: 'Gayathri-Regular',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
        width: '100%',
        justifyContent: 'center'
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
        backgroundColor: '#cce7ff'
    },
    calibrarButton: {
        position: 'absolute',
        bottom: 10,
        backgroundColor: '#2d5f90',
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 10,
        elevation: 5,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        width: '100%',
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

export default TransportadorScreen;