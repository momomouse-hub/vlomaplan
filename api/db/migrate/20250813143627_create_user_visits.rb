class CreateUserVisits < ActiveRecord::Migration[8.0]
  def change
    create_table :user_visits do |t|
      t.references :user, null: false, foreign_key: true, index: { unique: true }
      t.string :token, null: false, limit: 36
      t.datetime :created_at, null: false
    end

    add_index :user_visits, :token, unique: true
  end
end
