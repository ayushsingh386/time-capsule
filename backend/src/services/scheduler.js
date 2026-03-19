const cron = require('node-cron')
const supabase = require('../middleware/supabase')
const { sendUnlockEmail } = require('./mailer')

async function checkAndUnlockCapsules() {
  console.log('🔓 Scheduler: Checking for capsules to unlock...')
  try {
    const now = new Date().toISOString()

    // Find capsules past their unlock date but not yet marked
    const { data: toUnlock, error } = await supabase
      .from('capsules')
      .select('*, sender:profiles!sender_id(name, email)')
      .lte('unlock_date', now)
      .eq('is_unlocked', false)

    if (error) throw error
    if (!toUnlock || toUnlock.length === 0) {
      console.log('⏳ No new capsules to unlock.')
      return
    }

    console.log(`🎉 Unlocking ${toUnlock.length} capsule(s)...`)

    for (const capsule of toUnlock) {
      // Mark as unlocked
      await supabase
        .from('capsules')
        .update({ is_unlocked: true })
        .eq('id', capsule.id)

      // Get recipients to notify
      let recipientQuery = supabase
        .from('profiles')
        .select('id, name, email')
        .eq('role', capsule.recipient_type)

      if (capsule.batch_id) {
        recipientQuery = recipientQuery.eq('batch_id', capsule.batch_id)
      }

      const { data: recipients } = await recipientQuery

      if (recipients && recipients.length > 0) {
        for (const recipient of recipients) {
          // Create in-app notification
          await supabase.from('notifications').insert({
            user_id: recipient.id,
            message: `🎁 A time capsule from ${capsule.sender?.name || 'your batch'} has been unlocked! Open it now.`,
            is_read: false,
          })

          // Send email notification
          await sendUnlockEmail(recipient.email, recipient.name, capsule.sender?.name)
        }
      }
    }
    console.log('✅ Scheduler: Done unlocking capsules.')
  } catch (err) {
    console.error('Scheduler error:', err)
  }
}

function startScheduler() {
  // Run every hour
  cron.schedule('0 * * * *', checkAndUnlockCapsules)
  console.log('⏰ Capsule unlock scheduler started (runs every hour)')
}

module.exports = { startScheduler, checkAndUnlockCapsules }
