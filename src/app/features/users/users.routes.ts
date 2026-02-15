import { Routes } from "@angular/router";
import { UsersList } from "./pages/user-list/user-list";
import { UserDetails } from "./pages/user-details/user-details";

export const USERS_ROUTES: Routes = [
 { path: '', component: UsersList },
 { path: ':id', component: UserDetails },
];