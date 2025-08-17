require "pagy/extras/countless"
require "pagy/extras/limit"
require "pagy/extras/metadata"
require "pagy/extras/overflow"

Pagy::DEFAULT[:limit] = 20
Pagy::DEFAULT[:limit_max] = 100
Pagy::DEFAULT[:limit_param] = :per
Pagy::DEFAULT[:metadata] = [:page, :limit, :prev, :next]
Pagy::DEFAULT[:overflow] = :empty_page
