class AddIndexOnUsersCreatedAt < ActiveRecord::Migration[8.0]
  def change
    add_index :users, :created_at, if_not_exists: true
  end
end
