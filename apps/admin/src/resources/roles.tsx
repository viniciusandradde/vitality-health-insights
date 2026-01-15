import {
  List,
  Datagrid,
  TextField,
  Edit,
  SimpleForm,
  TextInput,
  Create,
  required,
} from "react-admin";

export const RoleList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="name" label="Nome" />
      <TextField source="description" label="Descrição" />
    </Datagrid>
  </List>
);

export const RoleEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="name" label="Nome" validate={required()} />
      <TextInput source="description" label="Descrição" multiline />
      <TextInput source="permissions" label="Permissões (JSON)" multiline />
    </SimpleForm>
  </Edit>
);

export const RoleCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" label="Nome" validate={required()} />
      <TextInput source="description" label="Descrição" multiline />
      <TextInput source="permissions" label="Permissões (JSON)" multiline />
    </SimpleForm>
  </Create>
);
