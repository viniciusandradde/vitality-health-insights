import {
  List,
  Datagrid,
  TextField,
  EmailField,
  Edit,
  SimpleForm,
  TextInput,
  Create,
  Show,
  SimpleShowLayout,
  SelectInput,
  ReferenceInput,
  required,
} from "react-admin";

export const UserList = () => (
  <List>
    <Datagrid rowClick="show">
      <TextField source="id" />
      <EmailField source="email" />
      <TextField source="full_name" label="Nome Completo" />
      <TextField source="phone" label="Telefone" />
      <TextField source="department" label="Departamento" />
      <TextField source="is_active" label="Ativo" />
    </Datagrid>
  </List>
);

export const UserEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="full_name" label="Nome Completo" validate={required()} />
      <TextInput source="email" validate={required()} />
      <TextInput source="phone" label="Telefone" />
      <TextInput source="department" label="Departamento" />
      <ReferenceInput source="role_id" reference="roles" label="Role">
        <SelectInput optionText="name" validate={required()} />
      </ReferenceInput>
      <SelectInput
        source="is_active"
        label="Ativo"
        choices={[
          { id: true, name: "Sim" },
          { id: false, name: "Não" },
        ]}
      />
    </SimpleForm>
  </Edit>
);

export const UserCreate = () => (
  <Create>
    <SimpleForm>
      <ReferenceInput source="tenant_id" reference="tenants" label="Tenant" validate={required()}>
        <SelectInput optionText="name" />
      </ReferenceInput>
      <TextInput source="full_name" label="Nome Completo" validate={required()} />
      <TextInput source="email" validate={required()} />
      <TextInput source="password" type="password" validate={required()} />
      <TextInput source="phone" label="Telefone" />
      <TextInput source="department" label="Departamento" />
      <ReferenceInput source="role_id" reference="roles" label="Role">
        <SelectInput optionText="name" validate={required()} />
      </ReferenceInput>
    </SimpleForm>
  </Create>
);

export const UserShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" />
      <EmailField source="email" />
      <TextField source="full_name" label="Nome Completo" />
      <TextField source="phone" label="Telefone" />
      <TextField source="department" label="Departamento" />
      <TextField source="is_active" label="Ativo" />
      <TextField source="is_verified" label="Verificado" />
      <TextField source="created_at" label="Criado em" />
    </SimpleShowLayout>
  </Show>
);
