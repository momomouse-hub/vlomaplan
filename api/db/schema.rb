# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_08_13_143627) do
  create_table "places", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "name", null: false
    t.string "address", null: false
    t.decimal "latitude", precision: 10, scale: 6, null: false
    t.decimal "longitude", precision: 10, scale: 6, null: false
    t.string "place_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["place_id"], name: "index_places_on_place_id", unique: true
  end

  create_table "user_visits", charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "token", limit: 36, null: false
    t.datetime "created_at", null: false
    t.index ["token"], name: "index_user_visits_on_token", unique: true
    t.index ["user_id"], name: "index_user_visits_on_user_id", unique: true
  end

  create_table "users", charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "video_view_places", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "video_view_id", null: false
    t.bigint "place_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["place_id"], name: "index_video_view_places_on_place_id"
    t.index ["video_view_id", "place_id"], name: "index_video_view_places_on_video_view_id_and_place_id", unique: true
    t.index ["video_view_id"], name: "index_video_view_places_on_video_view_id"
  end

  create_table "video_views", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "youtube_video_id", null: false
    t.string "title", null: false
    t.string "thumbnail_url", null: false
    t.bigint "search_history_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["youtube_video_id"], name: "index_video_views_on_youtube_video_id", unique: true
  end

  add_foreign_key "user_visits", "users"
  add_foreign_key "video_view_places", "places"
  add_foreign_key "video_view_places", "video_views"
end
