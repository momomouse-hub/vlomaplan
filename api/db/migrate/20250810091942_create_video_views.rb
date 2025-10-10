class CreateVideoViews < ActiveRecord::Migration[8.0]
  def change
    create_table :video_views do |t|
      t.string :youtube_video_id, null: false
      t.string :title, null: false
      t.string :thumbnail_url, null: false
      # t.references :search_history, foreign_key: true
      t.bigint :search_history_id, null: true

      t.timestamps
    end
    add_index :video_views, :youtube_video_id, unique: true
  end
end
