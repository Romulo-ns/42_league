const { createClient } = require('@supabase/supabase-js');

// Parse keys from .env.local
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

async function test() {
  console.log("Creating test user...");
  const email = `test_${Date.now()}@test.com`;
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: 'password123'
  });

  if (authError) {
    console.error("Auth error:", authError);
    return;
  }

  const user = authData.user;
  console.log("User created:", user.id);

  console.log("Testing insert...");
  const payload = [{
    user_id: user.id,
    match_id: 1,
    home_score: 2,
    away_score: 1
  }];

  const { data, error } = await supabase.from('predictions').upsert(payload, { onConflict: 'user_id, match_id' }).select();
  
  if (error) {
    console.error("Upsert error:", error);
  } else {
    console.log("Upsert success:", data);
  }
}

test();
