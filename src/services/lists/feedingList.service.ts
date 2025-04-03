import { getFeedingTypeList, getFeedingMarkList, } from "../../repositories/list.repository";

export const getFeedingTypeListUser = async () => {
    const feedingTypeList = await getFeedingTypeList();
    if (!feedingTypeList) throw new Error("No se pudo obtener la lista de tipos de alimentacion");
    return feedingTypeList;
};

export const getFeedingMarkListUser = async (feeding_type_id: number) => {
    if (!feeding_type_id) throw new Error("No se pudo obtener la lista de marcas de alimentacion");
    const feedingMarkList = await getFeedingMarkList(feeding_type_id);
    if (!feedingMarkList) throw new Error("No se pudo obtener la lista de marcas de alimentacion");
    return feedingMarkList;
};
