const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

async function test() {
  console.log("Testing user_scores view...");
  const { data, error } = await supabase.from('user_scores').select('*').limit(3);
  if (error) {
    console.error("Error fetching user_scores:", JSON.stringify(error, null, 2));
  } else {
    console.log("Data fetched successfully:", data);
  }
}

test();
