import { Admin, Resource } from "react-admin";
import { authProvider } from "./authProvider";
import { dataProvider } from "./dataProvider";
import { Dashboard } from "./components/Dashboard";
import { UserList, UserEdit, UserCreate, UserShow } from "./resources/users";
import { TenantList, TenantEdit, TenantCreate, TenantShow } from "./resources/tenants";
import { RoleList, RoleEdit, RoleCreate } from "./resources/roles";
import { IntegrationList, IntegrationEdit, IntegrationShow } from "./resources/integrations";
import { AuditLogList, AuditLogShow } from "./resources/auditLogs";
import { Login } from "./components/Login";

const App = () => (
  <Admin
    authProvider={authProvider}
    dataProvider={dataProvider}
    dashboard={Dashboard}
    loginPage={Login}
  >
    <Resource
      name="tenants"
      list={TenantList}
      create={TenantCreate}
      edit={TenantEdit}
      show={TenantShow}
    />
    <Resource
      name="users"
      list={UserList}
      create={UserCreate}
      edit={UserEdit}
      show={UserShow}
    />
    <Resource
      name="roles"
      list={RoleList}
      create={RoleCreate}
      edit={RoleEdit}
    />
    <Resource
      name="integrations"
      list={IntegrationList}
      edit={IntegrationEdit}
      show={IntegrationShow}
    />
    <Resource
      name="audit-logs"
      list={AuditLogList}
      show={AuditLogShow}
    />
  </Admin>
);

export default App;
