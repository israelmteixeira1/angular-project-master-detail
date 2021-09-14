import { InMemoryDbService } from "angular-in-memory-web-api";
import { Category } from "./pages/categories/shared/category.model";

export class InMemoryDatabase implements InMemoryDbService {
    createDb(){
        const categories: Category[] = [
            { id: 1,name: 'lazer', description:'parque, cinema, festa etc..' },
            { id: 2,name: 'academia', description:'mensalidade academia.' },
            { id: 3,name: 'energia', description:'conta de energia.' },
            { id: 4,name: 'investimentos', description:'aportes na bolsa.' }
        ]

        return { categories }
    }
}