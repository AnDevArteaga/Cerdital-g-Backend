import { getRaceList, getRaceTypeList, } from "../../repositories/list.repository";

export const getRaceTypeListUser = async () => {
    const raceTypeList = await getRaceTypeList();
    if (!raceTypeList) throw new Error("No se pudo obtener la lista de tipos de razas");
    return raceTypeList;
};

export const getRaceListUser = async ( race_type_id: number) => {
    if (!race_type_id) throw new Error("No se pudo obtener la lista de razas");
    const raceList = await getRaceList(race_type_id);
    if (!raceList) throw new Error("No se pudo obtener la lista de razas");
    return raceList;
};