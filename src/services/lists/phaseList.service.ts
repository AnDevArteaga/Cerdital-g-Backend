import { getPhaseList } from "../../repositories/list.repository";

export const getPhaseListUser = async () => {
    const phaseList = await getPhaseList();
    return phaseList;
};