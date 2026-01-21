import AsyncStorage from "@react-native-async-storage/async-storage"

const MEDICATION_KEY = "@medications"
const DOSE_HISTORY = "@dose_history"

export interface Medication{
    id: string;
    name: string;
    dosage: string;
    times: string[];
    startDate: string;
    duration: string;
    color: string;
    reminderEnabled: boolean;
    currentSupply: number;
    totalSupply: number;
    refillAt: number;
    refillReminder: boolean;
    lastRefillDate?:string;
}

export interface DoseHistory{
    id:string;
    medicationId:string;
    timestamp:string;
    taken:boolean;
}

export async function getMedication(): Promise<Medication[]>{
    try {
        const data = await AsyncStorage.getItem(MEDICATION_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Error Getting Medications", error);
        return [];
    }

}

export async function addMedication(medication: Medication) : Promise<void>{
    try {
        const medications = await getMedication();
        medications.push(medication);
        await AsyncStorage.setItem(MEDICATION_KEY, JSON.stringify(medications));

    } catch (error) {
        console.error("Error Adding Medications",error);
        throw error;
    }
}