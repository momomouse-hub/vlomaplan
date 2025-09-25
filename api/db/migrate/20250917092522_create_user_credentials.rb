class CreateUserCredentials < ActiveRecord::Migration[8.0]
  def change
    create_table :user_credentials do |t|
      t.references :user, null: false, foreign_key: true, index: { unique: true }
      t.string :email, null: false, limit: 255
      t.string :encrypted_password, null: false, limit: 60
      t.timestamps null: false
    end
    add_index :user_credentials, :email, unique: true
  end
end
