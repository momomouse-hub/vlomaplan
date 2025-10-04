class CreateTravelPlansAndItems < ActiveRecord::Migration[8.0]
  def change
    create_table :travel_plans do |t|
      t.references :user, null: false, foreign_key: true
      t.string :name, null: false, limit: 100
      t.timestamps null: false
    end
    add_index :travel_plans, [:user_id, :name], unique: true

    create_table :travel_plan_items do |t|
      t.references :travel_plan, null: false, foreign_key: true
      t.references :place, null: false, foreign_key: true
      t.integer :sort_order, null: false, default: 0
      t.timestamps null: false
    end
    add_index :travel_plan_items, [:travel_plan_id, :place_id], unique: true
    add_index :travel_plan_items, [:travel_plan_id, :sort_order]
  end
end
