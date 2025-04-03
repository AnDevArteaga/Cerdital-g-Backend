import { Meta } from "./meta.interface";

export interface ListResponse {
    meta: Meta;
}

export interface FeedingTypeResponse extends ListResponse {
    feedingType: any[];
}
export interface FeedingMarkResponse extends ListResponse {
    feedingMark: any[];
}
export interface DiseaseResponse extends ListResponse {
    disease: any[];
}    
export interface RaceTypeResponse extends ListResponse {
    raceType: any[];
}

export interface RaceResponse extends ListResponse {
    race: any[];
}