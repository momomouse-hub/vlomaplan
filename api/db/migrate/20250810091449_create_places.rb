class CreatePlaces < ActiveRecord::Migration[8.0]
  def change
    create_table :places do |t|
      t.string :name, null: false
      t.string :address, null: false
      t.decimal :latitude, precision: 10, scale: 6, null: false
      t.decimal :longitude, precision: 10, scale: 6, null: false
      t.string :place_id, null: false

      t.timestamps
    end
    add_index :places, :place_id, unique: true
  end
end
