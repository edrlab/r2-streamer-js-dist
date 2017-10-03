import { Link } from "./publication-link";
export interface IPublicationCollection {
    Role: string;
    Links: Link[];
    Children: IPublicationCollection[];
}
