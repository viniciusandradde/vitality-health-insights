import {
  List,
  Datagrid,
  TextField,
  Edit,
  SimpleForm,
  TextInput,
  Show,
  SimpleShowLayout,
  BooleanInput,
} from "react-admin";
import { JsonField } from "../components/JsonField";

export const IntegrationList = () => (
  <List>
    <Datagrid rowClick="show">
      <TextField source="id" />
      <TextField source="nome" label="Nome" />
      <TextField source="tipo" label="Tipo" />
      <TextField source="ativo" label="Ativo" />
      <TextField source="tenant_id" label="Tenant ID" />
    </Datagrid>
  </List>
);

export const IntegrationEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="nome" label="Nome" />
      <TextInput source="tipo" label="Tipo" />
      <TextInput source="url" label="URL" />
      <TextInput source="api_key" label="API Key" type="password" />
      <TextInput source="config" label="Config (JSON)" multiline />
      <BooleanInput source="ativo" label="Ativo" />
    </SimpleForm>
  </Edit>
);

export const IntegrationShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="nome" label="Nome" />
      <TextField source="tipo" label="Tipo" />
      <TextField source="url" label="URL" />
      <TextField source="ativo" label="Ativo" />
      <JsonField source="config" label="Configuração" />
      <TextField source="tenant_id" label="Tenant ID" />
      <TextField source="created_at" label="Criado em" />
    </SimpleShowLayout>
  </Show>
);
