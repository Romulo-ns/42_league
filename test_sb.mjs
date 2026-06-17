import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vosgfrbxahaiarhmzheg.supabase.co';
const supabaseAnonKey = 'sb_publishable_ylCRMdiZ4fMe9C6blp0iIQ_snYXNe_n';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { error } = await supabase.auth.getUser('Bearer');
  console.log('Result for "Bearer":', error?.message);

  const { error: e2 } = await supabase.auth.getUser('bearer');
  console.log('Result for "bearer":', e2?.message);

  const { error: e3 } = await supabase.auth.getUser({});
  console.log('Result for {}:', e3?.message);
}

test();
