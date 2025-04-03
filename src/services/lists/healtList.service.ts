import { getDiseaseList } from "../../repositories/list.repository";

export const getDiseaseListUser = async () => {
    const diseaseList = await getDiseaseList();
    if (!diseaseList) throw new Error("No se pudo obtener la lista de enfermedades");
    return diseaseList;
};