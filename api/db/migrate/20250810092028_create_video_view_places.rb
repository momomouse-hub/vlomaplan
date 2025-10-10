class CreateVideoViewPlaces < ActiveRecord::Migration[8.0]
  def change
    create_table :video_view_places do |t|
      t.references :video_view, null: false, foreign_key: true
      t.references :place, null: false, foreign_key: true

      t.timestamps
    end
    add_index :video_view_places, [:video_view_id, :place_id], unique: true
  end
end
