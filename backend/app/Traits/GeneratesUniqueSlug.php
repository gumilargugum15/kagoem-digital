<?php

namespace App\Traits;

use Illuminate\Support\Str;

trait GeneratesUniqueSlug
{
    protected function uniqueSlug(string $model, string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $i = 1;

        while (
            $model::where('slug', $slug)->when($ignoreId, fn ($q) => $q->whereNot('id', $ignoreId))->exists()
        ) {
            $slug = $base.'-'.++$i;
        }

        return $slug;
    }
}
