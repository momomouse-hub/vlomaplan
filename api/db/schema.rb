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

ActiveRecord::Schema[8.0].define(version: 2025_10_04_161709) do
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

  create_table "travel_plan_items", charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.bigint "travel_plan_id", null: false
    t.bigint "place_id", null: false
    t.integer "sort_order", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["place_id"], name: "index_travel_plan_items_on_place_id"
    t.index ["travel_plan_id", "place_id"], name: "index_travel_plan_items_on_travel_plan_id_and_place_id", unique: true
    t.index ["travel_plan_id", "sort_order"], name: "index_travel_plan_items_on_travel_plan_id_and_sort_order"
    t.index ["travel_plan_id"], name: "index_travel_plan_items_on_travel_plan_id"
  end

  create_table "travel_plans", charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "name", limit: 100, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id", "name"], name: "index_travel_plans_on_user_id_and_name", unique: true
    t.index ["user_id"], name: "index_travel_plans_on_user_id"
  end

  create_table "user_credentials", charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "email", null: false
    t.string "password_digest", limit: 60, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_user_credentials_on_email", unique: true
    t.index ["user_id"], name: "index_user_credentials_on_user_id", unique: true
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

  create_table "wishlists", charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "place_id", null: false
    t.datetime "created_at", null: false
    t.index ["place_id"], name: "index_wishlists_on_place_id"
    t.index ["user_id", "place_id"], name: "index_wishlists_on_user_id_and_place_id", unique: true
    t.index ["user_id"], name: "index_wishlists_on_user_id"
  end

  add_foreign_key "travel_plan_items", "places"
  add_foreign_key "travel_plan_items", "travel_plans"
  add_foreign_key "travel_plans", "users"
  add_foreign_key "user_credentials", "users"
  add_foreign_key "user_visits", "users"
  add_foreign_key "video_view_places", "places"
  add_foreign_key "video_view_places", "video_views"
  add_foreign_key "wishlists", "places"
  add_foreign_key "wishlists", "users"
end
