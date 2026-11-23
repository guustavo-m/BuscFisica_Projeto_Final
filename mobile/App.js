import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/$/, '');
const WEB = (process.env.EXPO_PUBLIC_WEB_URL || '').replace(/\/$/, '');
const purple = '#4c0661';
const dark = '#2f003d';
const lilac = '#9330b8';

async function request(path, token, options = {}) {
  const developmentHttp =
    typeof __DEV__ !== 'undefined' && __DEV__ && API.startsWith('http://');
  if (!API || (!API.startsWith('https://') && !developmentHttp)) {
    throw new Error('Configure EXPO_PUBLIC_API_URL. Em produção, utilize uma URL HTTPS.');
  }

  let response;
  try {
    response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error('Não foi possível conectar. Verifique sua internet e tente novamente.');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.mensagem || `Erro HTTP ${response.status}.`);
  }

  return data;
}

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');

  const [register, setRegister] = useState(false);
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');

  const [vests, setVests] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [topicos, setTopicos] = useState([]);

  const [vest, setVest] = useState('');
  const [materia, setMateria] = useState('');
  const [topico, setTopico] = useState('');

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const t = await SecureStore.getItemAsync('jwt');
        const u = await SecureStore.getItemAsync('user');
        if (t) {
          setToken(t);
          setUser(u ? JSON.parse(u) : null);
          setScreen('list');
        }
      } catch {}
    })();
  }, []);

  async function authenticate() {
    setError('');
    if (!email.trim() || !password || (register && !nome.trim())) {
      return setError('Preencha todos os campos.');
    }
    if (register && password.length < 8) {
      return setError('A senha precisa ter pelo menos 8 caracteres.');
    }

    setLoading(true);
    try {
      const data = await request(register ? '/auth/registrar' : '/auth/login', null, {
        method: 'POST',
        body: JSON.stringify(register ? { nome, email, password } : { email, password }),
      });

      if (register) {
        Alert.alert('Cadastro realizado', 'Sua conta foi criada. Faça login para continuar.');
        setRegister(false);
        setPassword('');
      } else {
        await SecureStore.setItemAsync('jwt', data.token);
        await SecureStore.setItemAsync('user', JSON.stringify(data.usuario));
        setToken(data.token);
        setUser(data.usuario);
        setScreen('list');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function load(filters = false) {
    if (!token) return;
    setLoading(true);
    setError('');

    try {
      const queryParams = new URLSearchParams({
        ...(vest ? { vestibular: vests.find((x) => String(x.id) === vest)?.sigla || '' } : {}),
        ...(materia ? { materia: materias.find((x) => String(x.id_mat) === materia)?.nome_mat || '' } : {}),
        ...(topico ? { topico: topicos.find((x) => String(x.id_top) === topico)?.nome_top || '' } : {}),
      });

      const [qs, vs, ms, ts] = await Promise.all([
        request('/questoes' + (filters ? `/filtro?${queryParams}` : ''), token),
        request('/vestibulares', token),
        request('/materia', token),
        request('/topico', token),
      ]);

      setItems(qs);
      setVests(vs);
      setMaterias(ms);
      setTopicos(ts);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    if (token && screen === 'list') {
      load(false);
    }
  }, [token, screen]);

  async function openQuestion(q) {
    setSelected(q);
    setSelectedOption('');
    setScreen('detail');
  }

  async function showAnswer() {
    setLoading(true);
    setError('');
    try {
      if (!selectedOption) {
        setError('Selecione uma alternativa antes de conferir.');
        return;
      }
      const data = await request(`/questoes/${selected.idq}`, token);
      setSelected(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await SecureStore.deleteItemAsync('jwt');
    await SecureStore.deleteItemAsync('user');
    setToken(null);
    setUser(null);
    setSelected(null);
    setScreen('login');
  }

  const Button = ({ title, onPress, secondary = false }) => (
    <TouchableOpacity style={[styles.button, secondary && styles.secondary]} onPress={onPress}>
      <Text style={[styles.buttonText, secondary && styles.secondaryText]}>{title}</Text>
    </TouchableOpacity>
  );

  const Field = ({
    value,
    onChangeText,
    placeholder,
    secureTextEntry = false,
    keyboardType = 'default',
  }) => (
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#777"
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize="none"
    />
  );

  const Picker = ({ label, value, options, onChange }) => (
    <View style={styles.pickerWrap}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[styles.chip, !value && styles.chipActive]}
          onPress={() => onChange('')}
        >
          <Text style={[styles.chipText, !value && styles.chipTextActive]}>Todos</Text>
        </TouchableOpacity>

        {options.map((o) => (
          <TouchableOpacity
            key={String(o.value)}
            style={[styles.chip, value === String(o.value) && styles.chipActive]}
            onPress={() => onChange(String(o.value))}
          >
            <Text style={[styles.chipText, value === String(o.value) && styles.chipTextActive]}>
              {o.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar backgroundColor={dark} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.brand}>BUSCFÍSICA</Text>
          <Text style={styles.tagline}>Seu conhecimento em movimento</Text>
        </View>

        {error ? (
          <TouchableOpacity onPress={() => setError('')}>
            <Text style={styles.error}>{error} ×</Text>
          </TouchableOpacity>
        ) : null}

        {screen === 'login' && (
          <ScrollView contentContainerStyle={styles.auth}>
            <Text style={styles.title}>{register ? 'CRIAR CONTA' : 'BEM-VINDO!'}</Text>
            <Text style={styles.subtitle}>
              {register
                ? 'Cadastre-se para estudar com o BuscFísica.'
                : 'Entre para acessar questões e conteúdos.'}
            </Text>

            {register && <Field value={nome} onChangeText={setNome} placeholder="Nome completo" />}

            <Field
              value={email}
              onChangeText={setEmail}
              placeholder="E-mail"
              keyboardType="email-address"
            />
            <Field value={password} onChangeText={setPassword} placeholder="Senha" secureTextEntry />

            {loading ? (
              <ActivityIndicator color={lilac} size="large" />
            ) : (
              <Button title={register ? 'CADASTRAR' : 'ENTRAR'} onPress={authenticate} />
            )}

            <Button
              title={register ? 'Já tenho conta' : 'Criar uma conta'}
              secondary
              onPress={() => {
                setRegister(!register);
                setError('');
              }}
            />
          </ScrollView>
        )}

        {screen === 'list' && (
          <View style={{ flex: 1 }}>
            <View style={styles.topline}>
              <Text style={styles.welcome}>Olá, {user?.nome || 'estudante'}!</Text>
              <TouchableOpacity onPress={logout}>
                <Text style={styles.logout}>SAIR</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filters}>
              <Picker
                label="VESTIBULAR"
                value={vest}
                onChange={setVest}
                options={vests.map((x) => ({ value: x.id, label: x.sigla }))}
              />
              <Picker
                label="MATÉRIA"
                value={materia}
                onChange={setMateria}
                options={materias.map((x) => ({ value: x.id_mat, label: x.nome_mat }))}
              />
              <Picker
                label="TÓPICO"
                value={topico}
                onChange={setTopico}
                options={topicos.map((x) => ({ value: x.id_top, label: x.nome_top }))}
              />
              <Button title="APLICAR FILTROS" onPress={() => load(true)} />
              <Button
                title="LIMPAR FILTROS"
                secondary
                onPress={() => {
                  setVest('');
                  setMateria('');
                  setTopico('');
                  setTimeout(() => load(false), 0);
                }}
              />
            </ScrollView>

            {loading ? (
              <ActivityIndicator style={{ margin: 24 }} size="large" color={lilac} />
            ) : (
              <FlatList
                data={items}
                keyExtractor={(x) => String(x.idq)}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => {
                      setRefreshing(true);
                      load(false);
                    }}
                  />
                }
                contentContainerStyle={{ padding: 16 }}
                ListEmptyComponent={<Text style={styles.empty}>Nenhuma questão encontrada.</Text>}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.question} onPress={() => openQuestion(item)}>
                    <Text style={styles.meta}>
                      {item.sigla} • {item.ano} • {item.dificuldade}
                    </Text>
                    <Text style={styles.questionTitle}>{item.topico}</Text>
                    <Text numberOfLines={3} style={styles.questionText}>
                      {item.enunciado}
                    </Text>
                    <Text style={styles.link}>VER QUESTÃO →</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        )}

        {screen === 'detail' && selected && (
          <ScrollView contentContainerStyle={styles.detail}>
            <TouchableOpacity onPress={() => setScreen('list')}>
              <Text style={styles.link}>← VOLTAR ÀS QUESTÕES</Text>
            </TouchableOpacity>

            <Text style={styles.meta}>
              {selected.sigla || 'QUESTÃO'} • {selected.ano || ''}
            </Text>
            <Text style={styles.title}>{selected.topico || 'Detalhamento'}</Text>
            <Text style={styles.body}>{selected.enunciado}</Text>

            {selected.imagem_url ? (
              <Image
                source={{
                  uri: selected.imagem_url.startsWith('./')
                    ? `${WEB}/img/${selected.imagem_url.slice(2)}`
                    : selected.imagem_url,
                }}
                style={styles.questionImage}
                resizeMode="contain"
              />
            ) : null}

            {['a', 'b', 'c', 'd', 'e'].map((k) =>
              selected[`alt_${k}`] ? (
                <TouchableOpacity
                  key={k}
                  disabled={Boolean(selected.resp_correta)}
                  style={[styles.option, selectedOption === k && styles.optionSelected]}
                  onPress={() => {
                    setSelectedOption(k);
                    setError('');
                  }}
                >
                  <Text style={styles.body}>{selected[`alt_${k}`]}</Text>
                </TouchableOpacity>
              ) : null
            )}

            <Button title="CONFERIR RESPOSTA E EXPLICAÇÃO" onPress={showAnswer} />

            {selected.resp_correta && (
              <View style={styles.answer}>
                <Text style={styles.answerTitle}>
                  {selected.resp_correta.match(/^\s*([A-E])/i)?.[1]?.toLowerCase() === selectedOption
                    ? 'MUITO BEM! VOCÊ ACERTOU.'
                    : 'VAMOS REVISAR ESTA QUESTÃO.'}
                </Text>
                <Text style={styles.body}>Gabarito: {selected.resp_correta}</Text>
                <Text style={styles.body}>{selected.explicacao_prof}</Text>
                {selected.videoaula ? (
                  <TouchableOpacity onPress={() => Linking.openURL(selected.videoaula.trim())}>
                    <Text style={styles.link}>ASSISTIR VIDEOAULA ↗</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            )}

            {loading && <ActivityIndicator color={lilac} />}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#e3d8e8',
  },
  header: {
    backgroundColor: dark,
    padding: 20,
    alignItems: 'center',
  },
  brand: {
    fontSize: 30,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
  },
  tagline: {
    color: '#eadcf0',
    marginTop: 3,
  },
  auth: {
    padding: 24,
    justifyContent: 'center',
    flexGrow: 1,
  },
  title: {
    fontSize: 27,
    fontWeight: '900',
    color: dark,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: purple,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: purple,
  },
  secondaryText: {
    color: purple,
  },
  error: {
    backgroundColor: '#ffe1e1',
    color: '#8b1717',
    padding: 12,
    textAlign: 'center',
  },
  topline: {
    padding: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcome: {
    fontSize: 19,
    fontWeight: '800',
    color: dark,
  },
  logout: {
    color: purple,
    fontWeight: '900',
  },
  filters: {
    maxHeight: 290,
    backgroundColor: '#f4edf6',
    padding: 12,
  },
  pickerWrap: {
    marginBottom: 10,
  },
  label: {
    fontWeight: '800',
    color: dark,
    marginBottom: 6,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginRight: 7,
    borderWidth: 1,
    borderColor: '#d2bfd9',
  },
  chipActive: {
    backgroundColor: purple,
  },
  chipText: {
    color: purple,
    fontSize: 12,
  },
  chipTextActive: {
    color: '#fff',
  },
  question: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 5,
    borderLeftColor: lilac,
  },
  meta: {
    color: '#7b438c',
    fontWeight: '800',
    fontSize: 12,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: dark,
    marginVertical: 7,
  },
  questionText: {
    color: '#333',
    lineHeight: 21,
  },
  link: {
    color: lilac,
    fontWeight: '900',
    marginTop: 12,
  },
  empty: {
    textAlign: 'center',
    color: '#555',
    marginTop: 30,
  },
  detail: {
    padding: 18,
  },
  body: {
    fontSize: 16,
    color: '#25202a',
    lineHeight: 25,
    marginVertical: 10,
  },
  questionImage: {
    width: '100%',
    height: 240,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 12,
  },
  option: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  optionSelected: {
    borderWidth: 2,
    borderColor: lilac,
  },
  answer: {
    backgroundColor: '#eee0f3',
    borderRadius: 14,
    padding: 15,
    marginTop: 15,
  },
  answerTitle: {
    fontWeight: '900',
    color: dark,
    fontSize: 18,
  },
});