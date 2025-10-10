class CreateWishlists < ActiveRecord::Migration[8.0]
  def change
    create_table :wishlists do |t|
      t.references :user, null: false, foreign_key: true
      t.references :place, null: false, foreign_key: true
      t.datetime :created_at, null: false
    end

    add_index :wishlists, [:user_id, :place_id], unique: true
  end
end