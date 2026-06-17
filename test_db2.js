const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

async function test() {
  console.log("Fetching unique user_ids from predictions...");
  const { data: pData } = await supabase.from('predictions').select('user_id');
  const predictedUsers = [...new Set(pData.map(p => p.user_id))];
  console.log("Users with predictions:", predictedUsers.length);
  
  console.log("Fetching profiles...");
  const { data: profData } = await supabase.from('profiles').select('user_id, nickname');
  console.log("Users with profiles:", profData.length);
  
  const noProfileUsers = predictedUsers.filter(uid => !profData.find(prof => prof.user_id === uid));
  console.log("Users with predictions but NO profile:", noProfileUsers.length);
  
  console.log("Users with predictions but NULL nickname in profile:", 
    profData.filter(p => !p.nickname && predictedUsers.includes(p.user_id)).length
  );
}

test();
