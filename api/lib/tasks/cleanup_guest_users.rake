# frozen_string_literal: true

namespace :maintenance do
  desc 'Delete unregistered users older than 7 days (and their dependents)'
  task cleanup_guest_users: :environment do
    cutoff = Time.zone.now - 7.days

    scope = User.left_joins(:user_credential)
                .where(user_credentials: { id: nil })
                .where('users.created_at < ?', cutoff)

    dry_run = ENV['DRY_RUN'] == '1'
    limit   = (ENV['LIMIT'] || 2000).to_i

    total = scope.count
    puts "[cleanup_guest_users] cutoff=#{cutoff} total_targets=#{total} DRY_RUN=#{dry_run}"

    if dry_run
      sample_ids = scope.limit(limit).pluck(:id, :created_at)
      puts "[cleanup_guest_users] sample(#{sample_ids.size}) id, created_at:"
      sample_ids.each { |id, t| puts "  #{id}, #{t}" }
      next
    end

    deleted = 0
    scope.find_in_batches(batch_size: 1000) do |users|
      users.each do |u|
        begin
          u.destroy!
          deleted += 1
        rescue => e
          warn "[cleanup_guest_users] failed user_id=#{u.id}: #{e.class}: #{e.message}"
        end
      end
    end

    puts "[cleanup_guest_users] deleted=#{deleted}/#{total}"
  end
end
