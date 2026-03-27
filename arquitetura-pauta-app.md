# 📋 Arquitetura — App de Pautas de Reunião

---

## 🗺️ Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                     USUÁRIO (Browser)                   │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│              ANGULAR APP (Frontend)                     │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Auth Module  │  │Pauta Module  │  │Config Module │  │
│  │(Google Login)│  │(Form/Preview)│  │(Templates)   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                  │          │
│  ┌──────▼─────────────────▼──────────────────▼───────┐  │
│  │               Services Layer                      │  │
│  │  AuthService │ DriveService │ FirestoreService    │  │
│  └──────┬───────────────┬──────────────────┬─────────┘  │
└─────────┼───────────────┼──────────────────┼────────────┘
          │               │                  │
          ▼               ▼                  ▼
   ┌─────────────┐ ┌─────────────┐  ┌───────────────┐
   │  Firebase   │ │ Google Drive│  │   Firestore   │
   │    Auth     │ │     API     │  │      DB       │
   │(OAuth2/JWT) │ │(REST v3)    │  │  (Templates + │
   └─────────────┘ └─────────────┘  │   Histórico)  │
                                    └───────────────┘
```

---

## 🔧 Stack Definitiva

| Camada | Tecnologia | Função |
|---|---|---|
| **Front-end** | Angular 17+ | SPA principal |
| **UI** | Primeng/Tailwind | Componentes prontos |
| **Autenticação** | Firebase Auth (Google) | Login + token OAuth2 |
| **Banco de dados** | Firestore | Templates e histórico de pautas |
| **Integração Drive** | Google Drive API v3 | Criar pasta, copiar doc, compartilhar |
| **Hospedagem** | Firebase Hosting | Deploy |
| **Back-end** | ❌ Não precisa | Drive API chamada direto do front com token OAuth2 |

> ✅ **Sem back-end Java.** O token do login Google já autoriza as chamadas à Drive API diretamente do Angular.

---

## 🗃️ Estrutura do Firestore

```
firestore/
│
├── users/
│   └── {uid}/
│       ├── driveRootFolderId: "ID da pasta raiz das pautas"
│       └── supervisor: "email@empresa.com"
│
├── templates/
│   └── {uid}/
│       └── {templateId}/
│           ├── nome: "Reunião Semanal de Equipe"
│           ├── participantes: ["João", "Maria", "Pedro"]
│           ├── horario: "09:00"
│           ├── local: "Sala 3 / Google Meet"
│           └── itens: [
│               {
│                 titulo: "Alinhamento de sprint",
│                 duracao: 15,
│                 subitem: "Verificar velocity do time"
│               }
│             ]
│
└── pautas/
    └── {uid}/
        └── {pautaId}/
            ├── assunto: "Reunião 27/03/2026"
            ├── criadaEm: timestamp
            ├── driveFileId: "ID do arquivo no Drive"
            ├── driveFileUrl: "https://docs.google.com/..."
            └── compartilhadoCom: ["supervisor@empresa.com"]
```

---

## 🖥️ Módulos do Angular

```
src/app/
│
├── core/
│   ├── services/
│   │   ├── auth.service.ts          # Firebase Auth + token Google
│   │   ├── drive.service.ts         # Todas as chamadas à Drive API
│   │   └── firestore.service.ts     # CRUD no Firestore
│   └── guards/
│       └── auth.guard.ts            # Protege rotas
│
├── features/
│   ├── auth/
│   │   └── login/                   # Tela de login com Google
│   │
│   ├── pauta/
│   │   ├── nova-pauta/              # Formulário principal ⭐
│   │   ├── preview-pauta/           # Preview antes de exportar
│   │   └── historico/               # Pautas já criadas
│   │
│   └── config/
│       ├── templates/               # Gerenciar templates
│       └── preferencias/            # Pasta Drive, supervisor
│
└── shared/
    ├── components/
    │   ├── item-pauta/              # Componente de item + subitem
    │   └── participante-chip/       # Chips de participantes
    └── models/
        ├── pauta.model.ts
        └── template.model.ts
```

---

## 🔄 Fluxo Completo da Aplicação

```
1. LOGIN
   └── Usuário clica "Entrar com Google"
       └── Firebase Auth abre popup Google
           └── Retorna: uid + accessToken (OAuth2)
               └── accessToken é salvo no AuthService (memória)

2. NOVA PAUTA
   └── Usuário abre "Nova Pauta"
       └── App carrega último template do Firestore
           └── Usuário ajusta: participantes, horário, local, assunto, itens
               └── Clica "Criar no Drive"

3. OPERAÇÕES NO DRIVE (com accessToken)
   └── Verifica se pasta do mês existe (ex: 2026.03)
       ├── Não existe → cria pasta
       └── Existe → usa pasta existente
           └── Copia o último arquivo de pauta (templateDriveFileId)
               └── Renomeia com o novo assunto
                   └── Atualiza conteúdo do documento
                       └── Compartilha com supervisor
                           └── Retorna URL do documento

4. SALVAR HISTÓRICO
   └── Salva no Firestore: { assunto, driveFileId, url, data }

5. RESULTADO
   └── Exibe link para abrir o documento no Drive ✅
```

---

---

# 🔥 PASSO A PASSO DO FIREBASE

## PASSO 1 — Criar o projeto no Firebase Console

1. Acesse **https://console.firebase.google.com**
2. Clique em **"Adicionar projeto"**
3. Nome do projeto: `pauta-reuniao` (ou o que preferir)
4. **Desative o Google Analytics** (não precisa aqui)
5. Clique em **"Criar projeto"**

---

## PASSO 2 — Ativar o Firebase Authentication

1. No menu lateral, clique em **"Build" → "Authentication"**
2. Clique em **"Começar"**
3. Na aba **"Sign-in method"**, clique em **"Google"**
4. Ative o toggle
5. Preencha o **e-mail de suporte** (seu e-mail)
6. Clique em **"Salvar"**

> ⚠️ **Importante:** O login com Google já configura automaticamente o OAuth2. O `accessToken` retornado é o mesmo usado para chamar a Drive API.

---

## PASSO 3 — Ativar o Firestore

1. No menu lateral, clique em **"Build" → "Firestore Database"**
2. Clique em **"Criar banco de dados"**
3. Escolha **"Iniciar no modo de produção"** (mais seguro)
4. Escolha a região: **`southamerica-east1`** (São Paulo — mais próximo)
5. Clique em **"Ativar"**

### Configurar as regras de segurança do Firestore

Vá em **Firestore → Regras** e cole:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Usuário só acessa os próprios dados
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /templates/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /pautas/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Clique em **"Publicar"**.

---

## PASSO 4 — Registrar o app Angular no Firebase

1. Na página inicial do projeto, clique no ícone **`</>`** (Web)
2. Nome do app: `pauta-app`
3. **Marque** "Configurar também o Firebase Hosting"
4. Clique em **"Registrar app"**
5. Copie o objeto `firebaseConfig` — você vai precisar dele

```typescript
// Exemplo do que você receberá:
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "pauta-reuniao.firebaseapp.com",
  projectId: "pauta-reuniao",
  storageBucket: "pauta-reuniao.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## PASSO 5 — Habilitar a Google Drive API no Google Cloud

> O Firebase usa o Google Cloud por baixo. Você precisa habilitar a Drive API no mesmo projeto.

1. Acesse **https://console.cloud.google.com**
2. No seletor de projetos (topo), selecione o projeto do Firebase (`pauta-reuniao`)
3. No menu lateral: **"APIs e serviços" → "Biblioteca"**
4. Pesquise por **"Google Drive API"**
5. Clique nela e depois em **"Ativar"**

---

## PASSO 6 — Configurar o escopo OAuth2 para o Drive

1. Ainda no Google Cloud Console: **"APIs e serviços" → "Tela de permissão OAuth"**
2. Se pedir para configurar, escolha **"Externo"** e preencha os dados básicos (nome do app, e-mail)
3. Na seção **"Escopos"**, clique em **"Adicionar ou remover escopos"**
4. Adicione os seguintes escopos:
   - `https://www.googleapis.com/auth/drive.file` ← **cria e acessa arquivos criados pelo app**
   - `https://www.googleapis.com/auth/drive.readonly` ← **lê pastas existentes**
5. Salve

> 💡 Use `drive.file` e não `drive` completo — é mais seguro e o Google não exige revisão manual.

---

## PASSO 7 — Configurar o Angular

### Instalar dependências

```bash
ng new pauta-app --routing --style=scss
cd pauta-app

# Firebase
npm install firebase @angular/fire

# Angular Material
ng add @angular/material
```

### Configurar o environment

`src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSy...",
    authDomain: "pauta-reuniao.firebaseapp.com",
    projectId: "pauta-reuniao",
    storageBucket: "pauta-reuniao.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
  },
  googleDriveScope: 'https://www.googleapis.com/auth/drive.file'
};
```

### Configurar o app.config.ts

```typescript
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from './environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideRouter(routes),
  ]
};
```

---

## PASSO 8 — AuthService com token para o Drive

```typescript
// core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, user } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private accessToken: string | null = null;
  currentUser$ = user(this.auth);

  constructor(private auth: Auth) {}

  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    // Solicita permissão ao Drive
    provider.addScope('https://www.googleapis.com/auth/drive.file');
    provider.addScope('https://www.googleapis.com/auth/drive.readonly');

    const result = await signInWithPopup(this.auth, provider);
    // Pega o accessToken OAuth2 — é ele que autoriza as chamadas ao Drive
    const credential = GoogleAuthProvider.credentialFromResult(result);
    this.accessToken = credential?.accessToken ?? null;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  async logout(): Promise<void> {
    this.accessToken = null;
    await signOut(this.auth);
  }
}
```

---

## PASSO 9 — DriveService (operações no Google Drive)

```typescript
// core/services/drive.service.ts
@Injectable({ providedIn: 'root' })
export class DriveService {
  private baseUrl = 'https://www.googleapis.com/drive/v3';
  private uploadUrl = 'https://www.googleapis.com/upload/drive/v3';

  constructor(private auth: AuthService) {}

  private get headers() {
    return { Authorization: `Bearer ${this.auth.getAccessToken()}` };
  }

  // Busca subpastas de uma pasta pai pelo nome
  async findFolder(parentId: string, name: string): Promise<string | null> {
    const query = `'${parentId}' in parents and name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const res = await fetch(`${this.baseUrl}/files?q=${encodeURIComponent(query)}`, {
      headers: this.headers
    });
    const data = await res.json();
    return data.files?.[0]?.id ?? null;
  }

  // Cria uma pasta
  async createFolder(parentId: string, name: string): Promise<string> {
    const res = await fetch(`${this.baseUrl}/files`, {
      method: 'POST',
      headers: { ...this.headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId]
      })
    });
    const data = await res.json();
    return data.id;
  }

  // Garante que a pasta do mês existe (cria se não existir)
  async getOrCreateMonthFolder(rootId: string): Promise<string> {
    const now = new Date();
    const folderName = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}`;
    const existing = await this.findFolder(rootId, folderName);
    return existing ?? await this.createFolder(rootId, folderName);
  }

  // Copia um arquivo
  async copyFile(fileId: string, newName: string, parentId: string): Promise<{id: string, url: string}> {
    const res = await fetch(`${this.baseUrl}/files/${fileId}/copy`, {
      method: 'POST',
      headers: { ...this.headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, parents: [parentId] })
    });
    const data = await res.json();
    return { id: data.id, url: `https://docs.google.com/document/d/${data.id}/edit` };
  }

  // Compartilha com um e-mail
  async shareFile(fileId: string, email: string): Promise<void> {
    await fetch(`${this.baseUrl}/files/${fileId}/permissions`, {
      method: 'POST',
      headers: { ...this.headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'user', role: 'writer', emailAddress: email })
    });
  }
}
```

---

## PASSO 10 — Deploy no Firebase Hosting

```bash
# Instalar Firebase CLI globalmente
npm install -g firebase-tools

# Login
firebase login

# Inicializar no projeto Angular
firebase init hosting

# Responda:
# → Use an existing project → selecione pauta-reuniao
# → Public directory → dist/pauta-app/browser
# → Single-page app? → Yes
# → GitHub auto-deploy? → No (por enquanto)

# Build do Angular
ng build --configuration=production

# Deploy
firebase deploy --only hosting
```

---

## 📅 Cronograma Realista

| Etapa | Tempo estimado |
|---|---|
| Setup Firebase (passos 1–6) | 30–40 min |
| Setup Angular + dependências | 20 min |
| AuthService + login Google | 1–2h |
| DriveService (pasta + cópia + share) | 3–4h |
| Formulário de pauta (Angular Material) | 4–6h |
| Firestore (templates + histórico) | 2–3h |
| Deploy + testes | 1h |
| **Total** | **~12–16h** (2–3 dias de trabalho real) |

---

## ⚠️ Pontos de atenção

1. **O `accessToken` do Google expira em 1 hora.** Para sessões longas, você precisa re-autenticar ou usar `getIdToken(true)` para renovar. Para uso pontual (criar uma pauta por vez), não é problema.

2. **O `drive.file` scope** só permite acessar arquivos que o **app criou**. Para copiar um template que você criou manualmente no Drive, use `drive.readonly` também (já adicionado no passo 6).

3. **Primeira vez no ar:** O Google pode mostrar tela de aviso "app não verificado". Para uso pessoal, clique em "Avançado → Ir para o app". Para distribuir, precisaria verificar o app no Google.
