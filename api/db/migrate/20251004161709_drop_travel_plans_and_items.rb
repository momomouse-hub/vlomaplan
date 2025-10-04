class DropTravelPlansAndItems < ActiveRecord::Migration[8.0]
  def change
    if foreign_key_exists?(:travel_plans_and_items, :users)
      remove_foreign_key :travel_plans_and_items, :users
    end

    drop_table :travel_plans_and_items, if_exists: true do |t|
      t.references :user, null: false, foreign_key: true
      t.string :name, limit: 100, null: false
      t.timestamps null: false
    end
  end
end
