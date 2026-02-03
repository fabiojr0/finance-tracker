// Script de teste para verificar conexão com Supabase
// Execute com: node test-supabase.js

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Testando conexão com Supabase...\n');

// Verificar variáveis de ambiente
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('📍 URL:', url || '❌ NÃO CONFIGURADA');
console.log('🔑 Key:', key ? '✅ Configurada (' + key.substring(0, 20) + '...)' : '❌ NÃO CONFIGURADA');
console.log('');

if (!url || !key) {
  console.error('❌ ERRO: Variáveis de ambiente não configuradas!');
  console.log('\n📝 Verifique o arquivo .env.local');
  process.exit(1);
}

// Criar cliente Supabase
const supabase = createClient(url, key);

async function test() {
  try {
    console.log('1️⃣ Testando autenticação...');

    // Tentar cadastrar um usuário de teste
    const testEmail = `teste-${Date.now()}@exemplo.com`;
    const testPassword = 'teste123456';

    console.log(`   Criando usuário: ${testEmail}`);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (signUpError) {
      console.error('   ❌ Erro ao criar usuário:', signUpError.message);

      // Verificar tipo de erro
      if (signUpError.message.includes('Email rate limit')) {
        console.log('   ⚠️ Limite de emails atingido. Aguarde alguns minutos.');
      } else if (signUpError.message.includes('already registered')) {
        console.log('   ⚠️ Email já cadastrado (isso é ok para teste)');
      } else if (signUpError.message.includes('Invalid API key')) {
        console.log('   ❌ Chave de API inválida! Verifique suas credenciais.');
        process.exit(1);
      }
    } else {
      console.log('   ✅ Usuário criado com sucesso!');
      console.log('   📧 ID:', signUpData.user?.id);
      console.log('   📬 Email:', signUpData.user?.email);
    }

    console.log('');
    console.log('2️⃣ Testando acesso às tabelas...');

    // Verificar se consegue acessar a tabela profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (profilesError) {
      console.error('   ❌ Erro ao acessar tabela profiles:', profilesError.message);

      if (profilesError.code === '42P01') {
        console.log('   ⚠️ Tabela "profiles" não existe!');
        console.log('   📝 Execute o SQL do README.md no Supabase SQL Editor');
      }
    } else {
      console.log('   ✅ Tabela profiles acessível');
    }

    // Verificar tabela categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .limit(1);

    if (categoriesError) {
      console.error('   ❌ Erro ao acessar tabela categories:', categoriesError.message);

      if (categoriesError.code === '42P01') {
        console.log('   ⚠️ Tabela "categories" não existe!');
        console.log('   📝 Execute o SQL do README.md no Supabase SQL Editor');
      }
    } else {
      console.log('   ✅ Tabela categories acessível');
    }

    // Verificar tabela transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .limit(1);

    if (transactionsError) {
      console.error('   ❌ Erro ao acessar tabela transactions:', transactionsError.message);

      if (transactionsError.code === '42P01') {
        console.log('   ⚠️ Tabela "transactions" não existe!');
        console.log('   📝 Execute o SQL do README.md no Supabase SQL Editor');
      }
    } else {
      console.log('   ✅ Tabela transactions acessível');
    }

    console.log('');
    console.log('3️⃣ Resumo do teste:');
    console.log('');

    if (!signUpError && !profilesError && !categoriesError && !transactionsError) {
      console.log('✅ TUDO FUNCIONANDO! Você pode criar sua conta normalmente.');
    } else {
      console.log('⚠️ PROBLEMAS ENCONTRADOS:');
      if (signUpError) console.log('   - Erro no cadastro');
      if (profilesError) console.log('   - Tabela profiles com problema');
      if (categoriesError) console.log('   - Tabela categories com problema');
      if (transactionsError) console.log('   - Tabela transactions com problema');
      console.log('');
      console.log('📖 Consulte o arquivo TROUBLESHOOTING.md para soluções');
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
    console.error(error);
  }
}

test();
