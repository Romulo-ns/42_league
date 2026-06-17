const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

async function test() {
  const { data, error } = await supabase.rpc('get_scores'); // just a dummy, let's fetch directly using JS
  
  const { data: profData } = await supabase.from('profiles').select('user_id, nickname');
  console.log("Profiles:", profData.map(p => p.nickname));
}

test();
