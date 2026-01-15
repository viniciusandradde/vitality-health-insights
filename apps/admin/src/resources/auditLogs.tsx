import {
  List,
  Datagrid,
  TextField,
  Show,
  SimpleShowLayout,
  DateField,
} from "react-admin";

export const AuditLogList = () => (
  <List>
    <Datagrid rowClick="show">
      <TextField source="id" />
      <TextField source="user_name" label="Usuário" />
      <TextField source="user_email" label="Email" />
      <TextField source="action" label="Ação" />
      <TextField source="resource" label="Recurso" />
      <DateField source="created_at" label="Data" showTime />
    </Datagrid>
  </List>
);

export const AuditLogShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="user_name" label="Usuário" />
      <TextField source="user_email" label="Email" />
      <TextField source="action" label="Ação" />
      <TextField source="resource" label="Recurso" />
      <TextField source="resource_id" label="ID do Recurso" />
      <TextField source="ip_address" label="IP" />
      <DateField source="created_at" label="Data" showTime />
    </SimpleShowLayout>
  </Show>
);
